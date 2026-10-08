/* Standalone ART review assembly; not a game loader or collision map. */
(() => {
  window.HangNhacArt = {
    world: {width: 2400, height: 1800},
    regions: [
      {id: 'northwest', x: 0, y: 0, width: 1320, height: 990, file: 'northwest-native.png'},
      {id: 'northeast', x: 1080, y: 0, width: 1320, height: 990, file: 'northeast-native.png'},
      {id: 'southwest', x: 0, y: 810, width: 1320, height: 990, file: 'southwest-native.png'},
      {id: 'southeast', x: 1080, y: 810, width: 1320, height: 990, file: 'southeast-native.png'}
    ],
    repairs: [
      {id: 'west-loop', x: 0, y: 600, width: 960, height: 640, file: 'west-loop-repair.png'},
      {id: 'east-loop', x: 1440, y: 600, width: 960, height: 640, file: 'east-loop-repair.png'},
      {id: 'north-axis', x: 720, y: 0, width: 960, height: 640, file: 'north-axis-repair.png'},
      {id: 'courtyard-join', x: 720, y: 515.2, width: 960, height: 640, file: 'courtyard-join-repair.png'},
      {id: 'gate-join', x: 720, y: 1108.2, width: 960, height: 640, file: 'gate-join-repair.png'}
    ],
    mount(root) {
      const north = document.createElement('div');
      const south = document.createElement('div');
      north.className = 'art-row north';
      south.className = 'art-row south';
      this.regions.forEach(region => {
        const img = document.createElement('img');
        img.src = region.file;
        img.alt = '';
        img.draggable = false;
        img.className = 'art-tile ' + (region.id.endsWith('east') ? 'east' : 'west');
        img.dataset.region = region.id;
        (region.id.startsWith('north') ? north : south).appendChild(img);
      });
      root.append(north, south);
      this.repairs.forEach(region => {
        const wrapper = document.createElement('div');
        wrapper.className = 'art-repair';
        if (region.x === 0) wrapper.classList.add('touches-west');
        if (region.x + region.width === this.world.width) wrapper.classList.add('touches-east');
        wrapper.dataset.repair = region.id;
        Object.assign(wrapper.style, {left: `${region.x}px`, top: `${region.y}px`, width: `${region.width}px`, height: `${region.height}px`});
        const img = document.createElement('img');
        img.src = region.file; img.alt = ''; img.draggable = false;
        if (region.y === 0) img.className = 'touches-north';
        wrapper.appendChild(img); root.appendChild(wrapper);
      });
    }
  };
})();
