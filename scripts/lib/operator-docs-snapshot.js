'use strict';

const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const YAML = require('yaml');
const { derivePageKey, readRegistry, validateRegistry } = require('./operator-docs');
const { sameReleaseProvenance } = require('./operator-docs-automation');

const CONTENT_ROOT = 'content/en/docs/krkn-operator';
const IMAGE_ROOT = 'static/images/krkn-operator';
const VIDEO_ROOT = 'static/videos';
const REGISTRY_PATH = path.join('data', 'operator_doc_versions.yaml');
const TRANSFORMATION_SCHEMA_VERSION = 3;
const STABLE_OPERATOR_TAG_PATTERN = /^v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/;
const ALLOWED_SHORTCODES = new Set(['notice', 'roadmap']);
const MEDIA_EXTENSION = /\.(?:avif|gif|jpe?g|png|svg|webp|mp4|webm|ogg|mp3|wav|pdf)$/i;

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function normalizeBuffer(value, label) {
  if (Buffer.isBuffer(value)) return value;
  if (typeof value === 'string') return Buffer.from(value);
  throw new Error(`${label} must contain Buffer or string bytes`);
}

function normalizeSnapshotText(text) {
  return `${text.replace(/[ \t\r\n]*$/, '')}\n`;
}

function parseFrontmatter(markdown, sourcePath) {
  const text = markdown.toString('utf8');
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return { frontmatter: {}, body: text };
  let frontmatter;
  try {
    frontmatter = YAML.parse(match[1], { uniqueKeys: true }) || {};
  } catch (error) {
    throw new Error(`${sourcePath}: invalid YAML frontmatter: ${error.message}`);
  }
  if (!frontmatter || typeof frontmatter !== 'object' || Array.isArray(frontmatter)) {
    throw new Error(`${sourcePath}: frontmatter must be a mapping`);
  }
  return { frontmatter, body: text.slice(match[0].length) };
}

function formatFrontmatter(frontmatter, body) {
  return `---\n${YAML.stringify(frontmatter).trimEnd()}\n---\n${normalizeSnapshotText(body)}`;
}

function splitUrlSuffix(url) {
  const index = url.search(/[?#]/);
  if (index === -1) return [url, ''];
  return [url.slice(0, index), url.slice(index)];
}

function rewriteUrl(url, tag, isMedia) {
  if (!url || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url)) {
    if (!url || !/^https?:\/\//i.test(url)) return url;
    let parsed;
    try {
      parsed = new URL(url);
    } catch (_) {
      return url;
    }
    if (parsed.hostname !== 'krkn-chaos.dev' && parsed.hostname !== 'www.krkn-chaos.dev') {
      return url;
    }
    const rewritten = rewriteUrl(`${parsed.pathname}${parsed.search}${parsed.hash}`, tag, isMedia);
    return `${parsed.origin}${rewritten}`;
  }
  if (!url.startsWith('/')) {
    if (isMedia && MEDIA_EXTENSION.test(splitUrlSuffix(url)[0])) {
      throw new Error(`uncaptured relative media dependency: ${url}`);
    }
    return url;
  }

  const [pathname, suffix] = splitUrlSuffix(url);
  const docsPrefix = '/docs/krkn-operator';
  if (pathname === docsPrefix || pathname.startsWith(`${docsPrefix}/`)) {
    let relative = pathname.slice(docsPrefix.length);
    if (!relative || relative === '/') relative = '/';
    return `${docsPrefix}/versions/${tag}${relative}${suffix}`;
  }

  const imagesPrefix = '/images/krkn-operator/';
  if (pathname.startsWith(imagesPrefix)) {
    const relative = pathname.slice(imagesPrefix.length);
    return `/operator-docs/${tag}/images/krkn-operator/${relative}${suffix}`;
  }
  if (pathname === '/images/krkn-operator') {
    return `/operator-docs/${tag}/images/krkn-operator/${suffix}`;
  }

  if (pathname.startsWith('/videos/')) {
    return `/operator-docs/${tag}/videos/${pathname.slice('/videos/'.length)}${suffix}`;
  }
  if (isMedia && MEDIA_EXTENSION.test(pathname)) {
    throw new Error(`uncaptured local media dependency: ${url}`);
  }
  return url;
}

function mapOutsideInlineCode(text, transform) {
  let output = '';
  let cursor = 0;
  while (cursor < text.length) {
    if (text[cursor] !== '`') {
      let end = text.indexOf('`', cursor);
      if (end === -1) end = text.length;
      output += transform(text.slice(cursor, end));
      cursor = end;
      continue;
    }
    let runEnd = cursor + 1;
    while (text[runEnd] === '`') runEnd += 1;
    const marker = text.slice(cursor, runEnd);
    const closing = text.indexOf(marker, runEnd);
    if (closing === -1) {
      output += text.slice(cursor);
      break;
    }
    output += text.slice(cursor, closing + marker.length);
    cursor = closing + marker.length;
  }
  return output;
}

function withoutInlineCode(text) {
  let output = '';
  let cursor = 0;
  while (cursor < text.length) {
    if (text[cursor] !== '`') {
      let end = text.indexOf('`', cursor);
      if (end === -1) end = text.length;
      output += text.slice(cursor, end);
      cursor = end;
      continue;
    }
    let runEnd = cursor + 1;
    while (text[runEnd] === '`') runEnd += 1;
    const marker = text.slice(cursor, runEnd);
    const closing = text.indexOf(marker, runEnd);
    if (closing === -1) break;
    cursor = closing + marker.length;
  }
  return output;
}

function rewriteHtmlTags(text, tag) {
  return text.replace(/<[A-Za-z][\w:-]*(?:"[^"]*"|'[^']*'|[^'">])*?>/g, (htmlTag) => {
    return htmlTag.replace(
      /\b(href|src)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/gi,
      (attribute, name, quoted, doubleQuoted, singleQuoted, unquoted) => {
        const value = doubleQuoted ?? singleQuoted ?? unquoted ?? '';
        const media = name.toLowerCase() === 'src' && /\b(?:img|source|video|audio)\b/i.test(htmlTag.slice(1));
        const rewritten = rewriteUrl(value, tag, media);
        if (rewritten === value) return attribute;
        const quote = quoted[0] === '"' || quoted[0] === "'" ? quoted[0] : '';
        return `${name}=${quote}${rewritten}${quote}`;
      }
    );
  });
}

function parseMarkdownDestination(text, start) {
  let cursor = start;
  while (/\s/.test(text[cursor] || '')) cursor += 1;
  if (text[cursor] === '<') {
    const end = text.indexOf('>', cursor + 1);
    if (end === -1) return null;
    return { start: cursor + 1, end, destination: text.slice(cursor + 1, end) };
  }
  const destinationStart = cursor;
  let escaped = false;
  let nestedParens = 0;
  while (cursor < text.length) {
    const character = text[cursor];
    if (escaped) {
      escaped = false;
      cursor += 1;
      continue;
    }
    if (character === '\\') {
      escaped = true;
      cursor += 1;
      continue;
    }
    if (character === '(') nestedParens += 1;
    if (character === ')') {
      if (nestedParens === 0) break;
      nestedParens -= 1;
    }
    if (/\s/.test(character) && nestedParens === 0) break;
    cursor += 1;
  }
  if (cursor === destinationStart) return null;
  return {
    start: destinationStart,
    end: cursor,
    destination: text.slice(destinationStart, cursor),
  };
}

function rewriteMarkdownDestinations(text, tag) {
  let output = '';
  let cursor = 0;
  while (cursor < text.length) {
    const close = text.indexOf('](', cursor);
    if (close === -1) {
      output += text.slice(cursor);
      break;
    }
    output += text.slice(cursor, close + 2);
    const destination = parseMarkdownDestination(text, close + 2);
    if (!destination) {
      cursor = close + 2;
      continue;
    }
    const openingBracket = text.lastIndexOf('[', close);
    const isImage = openingBracket > 0 && text[openingBracket - 1] === '!';
    const rewritten = rewriteUrl(destination.destination, tag, isImage);
    output += `${text.slice(close + 2, destination.start)}${rewritten}`;
    cursor = destination.end;
  }
  return output;
}

function rewriteReferenceDefinition(line, tag) {
  const match = line.match(/^(\s*\[[^\]]+\]:\s*)(<[^>]+>|[^\s]+)(.*)$/);
  if (!match) return line;
  const wrapped = match[2].startsWith('<');
  const destination = wrapped ? match[2].slice(1, -1) : match[2];
  const rewritten = rewriteUrl(destination, tag, false);
  return `${match[1]}${wrapped ? `<${rewritten}>` : rewritten}${match[3]}`;
}

function rewriteOperatorMarkdown(markdown, tag, sourcePath = '(snapshot page)') {
  const lines = markdown.split(/(?<=\n)/);
  const output = [];
  let fence = null;
  const youtubeUrls = new Set();
  let roadmapUsed = false;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const fenceMatch = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (fence) {
      output.push(line);
      if (
        fenceMatch &&
        fenceMatch[1][0] === fence.character &&
        fenceMatch[1].length >= fence.length
      ) {
        fence = null;
      }
      continue;
    }
    if (fenceMatch) {
      fence = { character: fenceMatch[1][0], length: fenceMatch[1].length };
      output.push(line);
      continue;
    }

    const withoutCode = withoutInlineCode(line);
    for (const shortcode of withoutCode.matchAll(/\{\{[<%]\s*\/?\s*([\w-]+)/g)) {
      const name = shortcode[1];
      if (!ALLOWED_SHORTCODES.has(name)) {
        throw new Error(`${sourcePath}:${index + 1}: unknown or unsupported shortcode ${name}`);
      }
      if (name === 'roadmap' && !shortcode[0].includes('/')) roadmapUsed = true;
    }
    if (/<script\b/i.test(withoutCode)) {
      throw new Error(`${sourcePath}:${index + 1}: unsupported custom script`);
    }

    let transformed = mapOutsideInlineCode(line, (segment) => {
      const html = rewriteHtmlTags(segment, tag);
      return rewriteReferenceDefinition(rewriteMarkdownDestinations(html, tag), tag);
    });
    for (const match of transformed.matchAll(/https?:\/\/(?:www\.)?youtube\.com\/[^\s"')]+/gi)) {
      youtubeUrls.add(match[0]);
    }
    if (/<iframe\b[^>]*youtube\.com\/embed\//i.test(transformed)) {
      transformed = transformed.replace(
        /<\/iframe>/gi,
        `</iframe>\n<p class="krkn-operator-docs-video-caption">This walkthrough is retained with ${tag} documentation and may show an earlier interface.</p>`
      );
    }
    output.push(transformed);
  }

  return {
    body: output.join(''),
    externalVideoDependencies: [...youtubeUrls].sort(),
    roadmapUsed,
  };
}

function rejectOverrides(frontmatter, sourcePath) {
  for (const key of ['url', 'slug', 'aliases', 'permalink']) {
    if (Object.prototype.hasOwnProperty.call(frontmatter, key)) {
      throw new Error(`${sourcePath}: unsupported URL override in frontmatter: ${key}`);
    }
  }
}

function pageDestination(relativePath, tag) {
  return `${CONTENT_ROOT}/versions/${tag}/${relativePath}`;
}

function markdownHeadingIds(markdown) {
  const ids = new Set();
  let fence = null;
  for (const line of markdown.split(/\r?\n/)) {
    const fenceMatch = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (fence) {
      if (fenceMatch && fenceMatch[1][0] === fence.character && fenceMatch[1].length >= fence.length) {
        fence = null;
      }
      continue;
    }
    if (fenceMatch) {
      fence = { character: fenceMatch[1][0], length: fenceMatch[1].length };
      continue;
    }

    for (const match of line.matchAll(/\bid=["']([^"']+)["']/g)) ids.add(match[1]);
    const heading = line.match(/^\s{0,3}#{1,6}\s+(.+?)\s*#*\s*$/);
    if (!heading) continue;
    const explicitId = heading[1].match(/\s+\{#([^}]+)\}\s*$/);
    if (explicitId) {
      ids.add(explicitId[1]);
      continue;
    }

    const plainText = heading[1]
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/<[^>]*>/g, '')
      .replace(/[`*_~]/g, '')
      .replace(/&(?:amp|lt|gt|quot|apos|#39);/gi, ' ')
      .normalize('NFKD')
      .replace(/\p{Diacritic}/gu, '')
      .toLocaleLowerCase();
    const id = plainText
      .replace(/[^\p{L}\p{N}_ -]/gu, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    if (id) ids.add(id);
  }
  return ids;
}

function planSnapshot({ releaseInputs, source, capturedAt = new Date().toISOString() }) {
  if (!releaseInputs || typeof releaseInputs !== 'object') {
    throw new Error('releaseInputs is required');
  }
  if (!Array.isArray(source?.pages)) throw new Error('source.pages must be an array');
  const tag = releaseInputs.tag;
  if (typeof tag !== 'string' || !STABLE_OPERATOR_TAG_PATTERN.test(tag)) {
    throw new Error(`tag is not a stable Operator release tag: ${tag}`);
  }
  const sourceHashes = {};
  const outputHashes = {};
  const files = [];
  const pageKeys = new Map();
  const pageByPath = new Map();
  const parsedPages = [];
  const allVideoDependencies = new Set();
  let roadmapUsed = false;

  for (const sourcePage of source.pages) {
    const relativePath = sourcePage.relativePath;
    if (
      typeof relativePath !== 'string' ||
      relativePath.startsWith('/') ||
      relativePath.includes('\\') ||
      relativePath.split('/').some((part) => !part || part === '.' || part === '..') ||
      !relativePath.endsWith('.md') ||
      relativePath === 'versions/_index.md' ||
      relativePath.startsWith('versions/')
    ) {
      throw new Error(`unsafe Operator documentation path: ${relativePath}`);
    }
    if (pageByPath.has(relativePath)) throw new Error(`duplicate source page ${relativePath}`);
    const sourcePath = `${CONTENT_ROOT}/${relativePath}`;
    const originalBytes = normalizeBuffer(sourcePage.bytes, sourcePath);
    const { frontmatter, body } = parseFrontmatter(originalBytes, sourcePath);
    rejectOverrides(frontmatter, sourcePath);
    const pageKey = derivePageKey(relativePath, frontmatter);
    if (pageKeys.has(pageKey)) {
      throw new Error(`duplicate page key "${pageKey}" in ${sourcePath} and ${pageKeys.get(pageKey)}`);
    }
    pageKeys.set(pageKey, sourcePath);
    pageByPath.set(relativePath, sourcePath);

    if (frontmatter.custom_js && !['installation/_index.md', 'feedback/_index.md'].includes(relativePath)) {
      throw new Error(`${sourcePath}: unsupported mutable custom_js dependency`);
    }
    delete frontmatter.operator_docs_version;
    frontmatter.operator_docs_version = tag;
    frontmatter.operator_docs_page_key = pageKey;
    delete frontmatter.exclude_search;

    let transformedBody;
    if (relativePath === 'feedback/_index.md') {
      delete frontmatter.custom_js;
      transformedBody = [
        'Feedback options for this archived release are available through the [current Operator feedback page](/community/operator-feedback/) or the [Krkn Operator issue tracker](https://github.com/krkn-chaos/krkn-operator/issues).',
        '',
      ].join('\n');
    } else {
      if (relativePath === 'installation/_index.md') {
        if (frontmatter.custom_js) {
          const customScripts = Array.isArray(frontmatter.custom_js)
            ? frontmatter.custom_js
            : [frontmatter.custom_js];
          const unsupportedScripts = customScripts.filter(
            (script) => String(script).trim() !== '/js/krkn-operator-version.js'
          );
          if (unsupportedScripts.length > 0) {
            throw new Error(`${sourcePath}: unsupported mutable custom_js dependency`);
          }
          delete frontmatter.custom_js;
        }
      }
      const transformed = rewriteOperatorMarkdown(body, tag, sourcePath);
      transformedBody = transformed.body;
      for (const video of transformed.externalVideoDependencies) allVideoDependencies.add(video);
      roadmapUsed ||= transformed.roadmapUsed;
      if (relativePath === 'installation/_index.md') {
        transformedBody = transformedBody
          .replace(/\*\*Latest Version:\*\*/g, '**Helm chart version for this release:**')
          .replace(/(<code\b[^>]*id=["']krkn-operator-version["'][^>]*>)[\s\S]*?(<\/code>)/i, `$1${releaseInputs.helm_chart_version}$2`)
          .replace(/<VERSION>/g, releaseInputs.helm_chart_version);
        if (/\bloading\.\.\./i.test(transformedBody)) {
          transformedBody = transformedBody.replace(/loading\.\.\./gi, releaseInputs.helm_chart_version);
        }
      }
    }
    const output = Buffer.from(formatFrontmatter(frontmatter, transformedBody));
    const destination = pageDestination(relativePath, tag);
    sourceHashes[sourcePath] = sha256(originalBytes);
    outputHashes[destination] = sha256(output);
    files.push({ path: destination, bytes: output });
    parsedPages.push({ relativePath, sourcePath, body, output: output.toString('utf8') });
  }

  if (!pageKeys.has('')) throw new Error('Operator snapshot is missing its overview page');
  const overview = parsedPages.find((page) => page.relativePath === '_index.md');
  if (!overview) throw new Error('Operator snapshot overview must be _index.md');
  const overviewAnchors = markdownHeadingIds(overview.output);
  for (const page of parsedPages) {
    for (const match of page.output.matchAll(/href=["'][^"']*\/versions\/[^"']*#([^"']+)["']/g)) {
      const anchor = decodeURIComponent(match[1]);
      const pathPart = match[0].slice(match[0].indexOf('=') + 2).split(/[?#]/)[0];
      if (/\/versions\/[^/]+\/?$/.test(pathPart) && !overviewAnchors.has(anchor)) {
        throw new Error(`${page.sourcePath}: Operator permission/link fragment #${anchor} is missing from the captured overview`);
      }
    }
  }

  const sourceImages = new Map();
  for (const image of source.imageFiles || []) {
    const relativePath = image.relativePath;
    if (
      typeof relativePath !== 'string' ||
      relativePath.startsWith('/') ||
      relativePath.split('/').some((part) => !part || part === '.' || part === '..')
    ) {
      throw new Error(`unsafe Operator image path: ${relativePath}`);
    }
    const bytes = normalizeBuffer(image.bytes, `${IMAGE_ROOT}/${relativePath}`);
    sourceImages.set(relativePath, bytes);
    sourceHashes[`${IMAGE_ROOT}/${relativePath}`] = sha256(bytes);
  }
  const sourceVideos = new Map();
  for (const video of source.videoFiles || []) {
    const relativePath = video.relativePath;
    if (
      typeof relativePath !== 'string' ||
      relativePath.startsWith('/') ||
      relativePath.split('/').some((part) => !part || part === '.' || part === '..')
    ) {
      throw new Error(`unsafe Operator video path: ${relativePath}`);
    }
    const bytes = normalizeBuffer(video.bytes, `${VIDEO_ROOT}/${relativePath}`);
    sourceVideos.set(relativePath, bytes);
    sourceHashes[`${VIDEO_ROOT}/${relativePath}`] = sha256(bytes);
  }

  const referencedImages = new Set();
  const referencedVideos = new Set();
  for (const page of parsedPages) {
    for (const match of page.output.matchAll(/(?:\]\(|(?:src|href)=["'])([^\s"')>]+)/g)) {
      const url = match[1];
      if (url.startsWith(`/operator-docs/${tag}/images/krkn-operator/`)) {
        referencedImages.add(url.split(/[?#]/)[0].split('/').slice(5).join('/'));
      }
      if (url.startsWith(`/operator-docs/${tag}/videos/`)) {
        referencedVideos.add(url.split(/[?#]/)[0].split('/').slice(4).join('/'));
      }
    }
  }
  for (const image of referencedImages) {
    if (!sourceImages.has(image)) throw new Error(`missing captured Operator image dependency: ${IMAGE_ROOT}/${image}`);
  }
  for (const video of referencedVideos) {
    if (!sourceVideos.has(video)) throw new Error(`missing captured Operator video dependency: ${VIDEO_ROOT}/${video}`);
  }

  for (const [relativePath, bytes] of sourceImages) {
    const destination = `static/operator-docs/${tag}/images/krkn-operator/${relativePath}`;
    outputHashes[destination] = sha256(bytes);
    files.push({ path: destination, bytes });
  }
  for (const [relativePath, bytes] of sourceVideos) {
    const destination = `static/operator-docs/${tag}/videos/${relativePath}`;
    outputHashes[destination] = sha256(bytes);
    files.push({ path: destination, bytes });
  }

  let roadmapPath = null;
  if (roadmapUsed) {
    if (!source.roadmapBytes) {
      throw new Error('roadmap shortcode is present but captured roadmap data is missing');
    }
    const roadmapBytes = normalizeBuffer(source.roadmapBytes, 'data/roadmap.yaml');
    try {
      YAML.parse(roadmapBytes.toString('utf8'), { uniqueKeys: true });
    } catch (error) {
      throw new Error(`captured roadmap data is invalid: ${error.message}`);
    }
    const roadmapOutput = Buffer.from(normalizeSnapshotText(roadmapBytes.toString('utf8')));
    sourceHashes['data/roadmap.yaml'] = sha256(roadmapBytes);
    roadmapPath = `data/operator_docs/releases/${tag}/roadmap.yaml`;
    outputHashes[roadmapPath] = sha256(roadmapOutput);
    files.push({ path: roadmapPath, bytes: roadmapOutput });
  }

  const expectedOutputInventory = files.map((file) => file.path).sort();
  const integrity = {
    schema_version: 1,
    transformation_schema_version: TRANSFORMATION_SCHEMA_VERSION,
    tag,
    github_release_id: releaseInputs.github_release_id,
    published_at: releaseInputs.published_at,
    operator_commit: releaseInputs.operator_commit,
    website_commit: releaseInputs.website_commit,
    helm_chart_version: releaseInputs.helm_chart_version,
    chart_reference: releaseInputs.chart_reference,
    captured_at: capturedAt,
    source_hashes: sourceHashes,
    output_hashes: outputHashes,
    expected_output_inventory: expectedOutputInventory,
    roadmap_record: roadmapPath,
    external_video_dependencies: [...allVideoDependencies].sort(),
    corrections: [],
  };
  const recordPath = `operator-docs/snapshots/${tag}.json`;
  files.push({ path: recordPath, bytes: Buffer.from(`${JSON.stringify(integrity, null, 2)}\n`) });
  return { files, integrity, recordPath };
}

function parseGitTree(output) {
  const entries = [];
  for (const record of output.toString('utf8').split('\0')) {
    if (!record) continue;
    const tab = record.indexOf('\t');
    if (tab === -1) throw new Error(`invalid git tree record: ${record}`);
    const [mode, type] = record.slice(0, tab).split(' ');
    const relativePath = record.slice(tab + 1);
    if (relativePath.includes('\n') || relativePath.includes('\r')) {
      throw new Error(`unsupported newline in Git path: ${JSON.stringify(relativePath)}`);
    }
    if (type !== 'blob' || !['100644', '100755'].includes(mode)) {
      throw new Error(`unsupported non-regular file in source tree: ${relativePath}`);
    }
    entries.push(relativePath);
  }
  return entries;
}

function runGit(repoRoot, args, options = {}) {
  try {
    return execFileSync('git', args, {
      cwd: repoRoot,
      encoding: options.encoding,
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    const detail = error.stderr?.toString().trim() || error.message;
    throw new Error(`git ${args[0]} failed: ${detail}`);
  }
}

function readSnapshotSource(repoRoot, websiteCommit) {
  if (!/^[0-9a-f]{40}$/i.test(websiteCommit || '')) {
    throw new Error('websiteCommit must be a full Git commit SHA');
  }
  runGit(repoRoot, ['cat-file', '-e', `${websiteCommit}^{commit}`]);
  const entries = parseGitTree(
    runGit(repoRoot, [
      'ls-tree',
      '-r',
      '-z',
      websiteCommit,
      '--',
      CONTENT_ROOT,
      IMAGE_ROOT,
      VIDEO_ROOT,
      'data/roadmap.yaml',
    ])
  );
  const pages = [];
  const imageFiles = [];
  const videoFiles = [];
  let roadmapBytes = null;
  for (const filePath of entries) {
    const bytes = runGit(repoRoot, ['show', `${websiteCommit}:${filePath}`]);
    if (filePath.startsWith(`${CONTENT_ROOT}/`)) {
      const relativePath = filePath.slice(CONTENT_ROOT.length + 1);
      if (relativePath === 'versions' || relativePath.startsWith('versions/')) continue;
      if (relativePath.endsWith('.md')) pages.push({ relativePath, bytes });
    } else if (filePath.startsWith(`${IMAGE_ROOT}/`)) {
      imageFiles.push({ relativePath: filePath.slice(IMAGE_ROOT.length + 1), bytes });
    } else if (filePath.startsWith(`${VIDEO_ROOT}/`)) {
      videoFiles.push({ relativePath: filePath.slice(VIDEO_ROOT.length + 1), bytes });
    } else if (filePath === 'data/roadmap.yaml') {
      roadmapBytes = bytes;
    }
  }
  pages.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
  imageFiles.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
  videoFiles.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
  return { pages, imageFiles, videoFiles, roadmapBytes };
}

function ensureSafeDestination(repoRoot, relativePath) {
  const absolute = path.resolve(repoRoot, relativePath);
  const root = path.resolve(repoRoot);
  if (absolute !== root && !absolute.startsWith(`${root}${path.sep}`)) {
    throw new Error(`snapshot destination escapes repository: ${relativePath}`);
  }
  let cursor = root;
  for (const segment of path.relative(root, absolute).split(path.sep)) {
    cursor = path.join(cursor, segment);
    try {
      const stat = fs.lstatSync(cursor);
      if (stat.isSymbolicLink()) throw new Error(`symlink in snapshot destination: ${relativePath}`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  return absolute;
}

function writeSnapshotFiles(repoRoot, files) {
  const repositoryRoot = path.resolve(repoRoot);
  const createdFiles = [];
  const createdDirectories = [];
  try {
    for (const file of files) {
      const absolute = ensureSafeDestination(repoRoot, file.path);
      if (fs.existsSync(absolute)) throw new Error(`refusing to overwrite existing snapshot path: ${file.path}`);
    }
    for (const file of files) {
      const absolute = ensureSafeDestination(repoRoot, file.path);
      const directory = path.dirname(absolute);
      const missing = [];
      let cursor = directory;
      while (cursor !== repositoryRoot && !fs.existsSync(cursor)) {
        missing.push(cursor);
        cursor = path.dirname(cursor);
      }
      fs.mkdirSync(directory, { recursive: true });
      createdDirectories.push(...missing.reverse());
      fs.writeFileSync(absolute, file.bytes, { flag: 'wx' });
      createdFiles.push(absolute);
    }
  } catch (error) {
    for (const file of createdFiles.reverse()) {
      try { fs.unlinkSync(file); } catch (_) { /* preserve original failure */ }
    }
    for (const directory of createdDirectories.reverse()) {
      try { fs.rmdirSync(directory); } catch (_) { /* non-empty or already removed */ }
    }
    throw error;
  }
  return { createdFiles, createdDirectories };
}

function rollbackCreatedFiles(created) {
  for (const file of [...created.createdFiles].reverse()) {
    try { fs.unlinkSync(file); } catch (_) { /* preserve original failure */ }
  }
  for (const directory of [...created.createdDirectories].reverse()) {
    try { fs.rmdirSync(directory); } catch (_) { /* non-empty or already removed */ }
  }
}

function captureSnapshot({
  repoRoot,
  releaseInputs,
  adoptionBoundary,
  now = () => new Date().toISOString(),
}) {
  const registry = readRegistry(repoRoot);
  if (adoptionBoundary) {
    if (!Number.isFinite(Date.parse(adoptionBoundary))) {
      throw new Error('adoptionBoundary must be an ISO timestamp');
    }
    if (
      registry.adoption_boundary_published_at &&
      registry.adoption_boundary_published_at !== adoptionBoundary
    ) {
      throw new Error('the published-release adoption boundary is already established');
    }
  }
  const existing = registry.releases.find((release) => release.tag === releaseInputs.tag);
  if (existing) {
    const sameProvenance = sameReleaseProvenance(existing, releaseInputs);
    if (!sameProvenance) {
      throw new Error(`release ${releaseInputs.tag} already exists with different provenance`);
    }
    validateSnapshotRecord(repoRoot, existing);
    return { status: 'unchanged', release: existing };
  }

  const source = readSnapshotSource(repoRoot, releaseInputs.website_commit);
  const capturedAt = now();
  const plan = planSnapshot({ releaseInputs, source, capturedAt });
  const newRegistry = {
    ...registry,
    ...(adoptionBoundary ? { adoption_boundary_published_at: adoptionBoundary } : {}),
    releases: [
      ...registry.releases,
      {
        ...releaseInputs,
        captured_at: capturedAt,
        snapshot_record: plan.recordPath,
      },
    ],
  };
  validateRegistry(newRegistry);
  const registryBytes = Buffer.from(YAML.stringify(newRegistry));
  const created = writeSnapshotFiles(repoRoot, plan.files);
  const registryFile = ensureSafeDestination(repoRoot, REGISTRY_PATH);
  const temporaryRegistry = `${registryFile}.tmp-${process.pid}-${crypto.randomBytes(6).toString('hex')}`;
  try {
    fs.writeFileSync(temporaryRegistry, registryBytes, { flag: 'wx' });
    fs.renameSync(temporaryRegistry, registryFile);
  } catch (error) {
    try { fs.unlinkSync(temporaryRegistry); } catch (_) { /* may not exist */ }
    rollbackCreatedFiles(created);
    throw new Error(`unable to update ${REGISTRY_PATH}: ${error.message}`);
  }
  const allFiles = [...plan.files, { path: REGISTRY_PATH, bytes: registryBytes }];
  return {
    status: 'captured',
    release: newRegistry.releases.at(-1),
    integrity: plan.integrity,
    files: allFiles.map((file) => file.path),
  };
}

function validateSnapshotRecord(repoRoot, release) {
  const recordFile = ensureSafeDestination(repoRoot, release.snapshot_record);
  if (!fs.existsSync(recordFile)) throw new Error(`missing snapshot record: ${release.snapshot_record}`);
  let record;
  try {
    record = JSON.parse(fs.readFileSync(recordFile, 'utf8'));
  } catch (error) {
    throw new Error(`invalid snapshot record ${release.snapshot_record}: ${error.message}`);
  }
  if (
    record.schema_version !== 1 ||
    record.tag !== release.tag ||
    record.github_release_id !== release.github_release_id ||
    record.published_at !== release.published_at ||
    record.operator_commit !== release.operator_commit ||
    record.website_commit !== release.website_commit ||
    record.helm_chart_version !== release.helm_chart_version ||
    record.chart_reference !== release.chart_reference ||
    record.captured_at !== release.captured_at
  ) {
    throw new Error(`snapshot provenance does not match registry entry for ${release.tag}`);
  }
  const inventory = record.expected_output_inventory;
  if (!Array.isArray(inventory) || !record.output_hashes || typeof record.output_hashes !== 'object') {
    throw new Error(`invalid snapshot output inventory for ${release.tag}`);
  }
  const sourceHashes = record.source_hashes;
  if (
    !sourceHashes ||
    typeof sourceHashes !== 'object' ||
    Array.isArray(sourceHashes) ||
    Object.keys(sourceHashes).length === 0
  ) {
    throw new Error(`invalid source hash inventory for ${release.tag}`);
  }
  if (!Array.isArray(record.corrections)) {
    throw new Error(`invalid correction inventory for ${release.tag}`);
  }
  const expected = [...inventory].sort();
  if (new Set(expected).size !== expected.length) {
    throw new Error(`snapshot inventory contains duplicate paths for ${release.tag}`);
  }
  const actualHashPaths = Object.keys(record.output_hashes).sort();
  if (JSON.stringify(expected) !== JSON.stringify(actualHashPaths)) {
    throw new Error(`snapshot inventory/hash list mismatch for ${release.tag}`);
  }
  for (const relativePath of expected) {
    const allowedRoots = [
      `${CONTENT_ROOT}/versions/${release.tag}/`,
      `static/operator-docs/${release.tag}/`,
      `data/operator_docs/releases/${release.tag}/`,
    ];
    if (!allowedRoots.some((root) => relativePath.startsWith(root))) {
      throw new Error(`snapshot output escapes release-owned paths: ${relativePath}`);
    }
    if (!/^[0-9a-f]{64}$/.test(record.output_hashes[relativePath] || '')) {
      throw new Error(`invalid snapshot output hash for ${relativePath}`);
    }
    const filePath = ensureSafeDestination(repoRoot, relativePath);
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      throw new Error(`missing snapshot output: ${relativePath}`);
    }
    const actual = sha256(fs.readFileSync(filePath));
    if (actual !== record.output_hashes[relativePath]) {
      throw new Error(`snapshot output hash mismatch: ${relativePath}`);
    }
  }
  for (const [sourcePath, sourceHash] of Object.entries(sourceHashes)) {
    if (
      typeof sourcePath !== 'string' ||
      path.posix.isAbsolute(sourcePath) ||
      sourcePath.split('/').includes('..') ||
      path.posix.normalize(sourcePath) !== sourcePath
    ) {
      throw new Error(`invalid snapshot source path for ${release.tag}`);
    }
    if (!/^[0-9a-f]{64}$/.test(sourceHash)) {
      throw new Error(`invalid snapshot source hash for ${release.tag}`);
    }
  }
  for (const correction of record.corrections) {
    if (
      !correction ||
      typeof correction !== 'object' ||
      typeof correction.corrected_at !== 'string' ||
      !Number.isFinite(Date.parse(correction.corrected_at)) ||
      typeof correction.reason !== 'string' ||
      !correction.reason.trim() ||
      !Array.isArray(correction.affected_paths) ||
      correction.affected_paths.length === 0
    ) {
      throw new Error(`invalid snapshot correction entry for ${release.tag}`);
    }
    const affectedPaths = new Set();
    for (const affectedPath of correction.affected_paths) {
      if (!expected.includes(affectedPath) || affectedPaths.has(affectedPath)) {
        throw new Error(`correction path is not in snapshot inventory for ${release.tag}`);
      }
      affectedPaths.add(affectedPath);
    }
  }
  const actualFiles = new Set();
  for (const root of [
    `${CONTENT_ROOT}/versions/${release.tag}`,
    `static/operator-docs/${release.tag}`,
    `data/operator_docs/releases/${release.tag}`,
  ]) {
    const absoluteRoot = ensureSafeDestination(repoRoot, root);
    if (fs.existsSync(absoluteRoot)) walkRegularFiles(repoRoot, absoluteRoot, actualFiles);
  }
  const expectedFiles = new Set(expected.map((relativePath) => path.resolve(repoRoot, relativePath)));
  for (const absoluteFile of actualFiles) {
    if (!expectedFiles.has(absoluteFile)) {
      throw new Error(`unexpected snapshot output: ${path.relative(repoRoot, absoluteFile)}`);
    }
  }
  return record;
}

function walkRegularFiles(repoRoot, absolutePath, files) {
  const stat = fs.lstatSync(absolutePath);
  if (stat.isSymbolicLink()) {
    throw new Error(`symlink in snapshot outputs: ${path.relative(repoRoot, absolutePath)}`);
  }
  if (stat.isFile()) {
    files.add(absolutePath);
    return;
  }
  if (!stat.isDirectory()) {
    throw new Error(`unsupported snapshot output type: ${path.relative(repoRoot, absolutePath)}`);
  }
  for (const entry of fs.readdirSync(absolutePath).sort()) {
    walkRegularFiles(repoRoot, path.join(absolutePath, entry), files);
  }
}

function validateSnapshots(repoRoot, registry) {
  const currentRegistry = registry || readRegistry(repoRoot);
  validateRegistry(currentRegistry);
  const tags = new Set(currentRegistry.releases.map((release) => release.tag));
  for (const release of currentRegistry.releases) {
    validateSnapshotRecord(repoRoot, release);
  }

  const checks = [
    {
      root: `${CONTENT_ROOT}/versions`,
      allowContainer: true,
      description: 'content snapshot',
    },
    {
      root: 'static/operator-docs',
      allowContainer: false,
      description: 'static snapshot',
    },
    {
      root: 'data/operator_docs/releases',
      allowContainer: false,
      description: 'roadmap snapshot',
    },
  ];
  for (const check of checks) {
    const absoluteRoot = ensureSafeDestination(repoRoot, check.root);
    if (!fs.existsSync(absoluteRoot)) continue;
    const rootStat = fs.lstatSync(absoluteRoot);
    if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) {
      throw new Error(`invalid ${check.description} root: ${check.root}`);
    }
    for (const entry of fs.readdirSync(absoluteRoot).sort()) {
      if (check.allowContainer && entry === '_index.md') continue;
      const entryPath = path.join(absoluteRoot, entry);
      const stat = fs.lstatSync(entryPath);
      if (stat.isSymbolicLink()) {
        throw new Error(`symlink in ${check.description} root: ${entry}`);
      }
      if (!stat.isDirectory() || !tags.has(entry)) {
        throw new Error(`unregistered ${check.description} directory: ${entry}`);
      }
    }
  }

  const recordDirectory = ensureSafeDestination(repoRoot, 'operator-docs/snapshots');
  if (fs.existsSync(recordDirectory)) {
    const stat = fs.lstatSync(recordDirectory);
    if (stat.isSymbolicLink() || !stat.isDirectory()) {
      throw new Error('invalid Operator snapshot record directory');
    }
    for (const entry of fs.readdirSync(recordDirectory).sort()) {
      const match = entry.match(/^(v.+)\.json$/);
      if (!match || !tags.has(match[1])) {
        throw new Error(`unregistered Operator snapshot record: ${entry}`);
      }
    }
  }
  return undefined;
}

module.exports = {
  captureSnapshot,
  parseFrontmatter,
  planSnapshot,
  readSnapshotSource,
  rewriteOperatorMarkdown,
  sha256,
  validateSnapshots,
  validateSnapshotRecord,
  writeSnapshotFiles,
};
