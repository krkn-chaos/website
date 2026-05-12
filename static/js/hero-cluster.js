(function () {
  'use strict';
  var cluster = document.getElementById('hero-cluster');
  var ring = document.getElementById('hero-cluster-ring');
  var linesSvg = document.getElementById('hero-cluster-lines');
  var debris = document.getElementById('hero-cluster-debris');
  if (!cluster || !ring) return;

  var nodes = ring.querySelectorAll('.hero-cluster__node');
  var NODE_COUNT = nodes.length;
  var SIZE = 480;             // viewBox and container size
  var CX = SIZE / 2;
  var CY = SIZE / 2;
  var RADIUS = 195;           // orbit radius
  var angleOffset = 0;
  var orbitRAF = null;
  var isHovering = false;
  var chaosInterval = null;

  // --- Position nodes on a circle, draw network lines ---
  function positionNodes(chaos) {
    var linesHTML = '';
    var coords = [];

    nodes.forEach(function (node, i) {
      var angle = (i / NODE_COUNT) * Math.PI * 2 + angleOffset;
      var nx, ny;

      if (chaos) {
        var scatter = RADIUS + 30 + Math.random() * 50;
        var jitter = (Math.random() - 0.5) * 0.5;
        nx = CX + Math.cos(angle + jitter) * scatter;
        ny = CY + Math.sin(angle + jitter) * scatter;
      } else {
        nx = CX + Math.cos(angle) * RADIUS;
        ny = CY + Math.sin(angle) * RADIUS;
      }

      coords.push({ x: nx, y: ny });
      node.style.left = (nx / SIZE * 100) + '%';
      node.style.top = (ny / SIZE * 100) + '%';
    });

    // Draw network topology lines (only in peaceful mode)
    if (!chaos && linesSvg) {
      for (var i = 0; i < NODE_COUNT; i++) {
        var next = (i + 1) % NODE_COUNT;
        // Perimeter connections
        linesHTML += '<line x1="' + coords[i].x + '" y1="' + coords[i].y +
          '" x2="' + coords[next].x + '" y2="' + coords[next].y +
          '" stroke="var(--krkn-border-prominent)" stroke-width="1" opacity="0.35"/>';
        // Spokes to center (control plane)
        linesHTML += '<line x1="' + coords[i].x + '" y1="' + coords[i].y +
          '" x2="' + CX + '" y2="' + CY +
          '" stroke="var(--krkn-border-prominent)" stroke-width="0.6" opacity="0.15" stroke-dasharray="5 5"/>';
      }
      linesSvg.innerHTML = linesHTML;
    }
  }

  // --- Smooth orbiting loop ---
  function orbit() {
    if (isHovering) return;
    angleOffset += 0.002;
    positionNodes(false);
    orbitRAF = requestAnimationFrame(orbit);
  }

  // --- Chaos debris: warnings, errors, crash symbols ---
  function spawnDebris() {
    var items = [
      { text: 'CrashLoopBackOff', cls: 'text' },
      { text: 'OOMKilled', cls: 'text' },
      { text: 'NodeNotReady', cls: 'text' },
      { text: 'pod/api-7f2 Terminated', cls: 'text' },
      { text: 'SIGKILL', cls: 'text' },
      { text: '503', cls: 'code' },
      { text: '⚠', cls: 'icon' },
      { text: '✕', cls: 'icon' },
      { text: '⚡', cls: 'icon' },
    ];
    var count = 5 + Math.floor(Math.random() * 3);

    for (var i = 0; i < count; i++) {
      var item = items[Math.floor(Math.random() * items.length)];
      var el = document.createElement('span');
      el.className = 'hero-cluster__debris-item hero-cluster__debris-item--' + item.cls;
      el.textContent = item.text;

      var angle = Math.random() * Math.PI * 2;
      var dist = 80 + Math.random() * 140;
      el.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
      el.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
      el.style.left = (45 + Math.random() * 10) + '%';
      el.style.top = (45 + Math.random() * 10) + '%';
      el.style.animationDelay = (Math.random() * 0.3) + 's';

      debris.appendChild(el);
      (function (e) {
        setTimeout(function () { if (e.parentNode) e.parentNode.removeChild(e); }, 1800);
      })(el);
    }
  }

  // --- Enter chaos ---
  function enterChaos() {
    isHovering = true;
    if (orbitRAF) { cancelAnimationFrame(orbitRAF); orbitRAF = null; }
    cluster.classList.add('hero-cluster--chaos');
    positionNodes(true);

    // Staggered node hits — like the octopus attacking each one
    nodes.forEach(function (node, i) {
      setTimeout(function () {
        node.classList.add('hero-cluster__node--hit');
      }, i * 120 + Math.random() * 60);
    });

    spawnDebris();
    chaosInterval = setInterval(function () {
      if (isHovering) spawnDebris();
    }, 1200);
  }

  // --- Exit chaos — everything heals ---
  function exitChaos() {
    isHovering = false;
    cluster.classList.remove('hero-cluster--chaos');
    nodes.forEach(function (node) {
      node.classList.remove('hero-cluster__node--hit');
    });
    if (chaosInterval) { clearInterval(chaosInterval); chaosInterval = null; }
    positionNodes(false);
    orbit();
  }

  // Init
  positionNodes(false);
  orbit();
  cluster.addEventListener('mouseenter', enterChaos);
  cluster.addEventListener('mouseleave', exitChaos);
})();
