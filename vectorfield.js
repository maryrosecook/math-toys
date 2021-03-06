// Display a C->C map as a vector field.

'use strict';

const cnum = mathtoys.complex;
const sh = mathtoys.sheet;

let quiver, sheet;
let xVar;

function onLoad() {
    quiver = sh.makeQuiver();
    xVar = quiver.add({op: sh.variableOp, at: {re: 1, im: 1}});
    xVar.label = 'x';
    const ui = sh.makeSheetUI(quiver, canvas1, {}, {});
    ui.show();

    sheet = sh.makeSheet(canvas2);
    sheet.drawGrid();
    sheet.ctx.strokeStyle = 'black';
    drawMap(sheet, z => z, 0.05, 15);

    quiver.addWatcher(onChange);

    function onChange(event) {
        if (!watching) return;
        if (event.tag === 'add') {
            addSheet(event.arrow);
        } else {
            update();
        }
    }
}

let watching = true;

// Pairs of [arrow, sheet].
const pairs = [];

function addSheet(arrow) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas1.width;
    canvas.height = canvas1.height;
    document.getElementById('sheets').appendChild(canvas);
    document.getElementById('sheets').appendChild(document.createTextNode(' '));
    const sheet = sh.makeSheet(canvas);
    pairs.push([arrow, sheet]);
    update();
}

const pendingUpdates = [];

function update() {
    // Schedule pending updates round-robin style, to avoid starving
    // the updating of the later elements of pairs.
    pairs.filter(complement(isPending)).forEach(p => {
        pendingUpdates.push(p);
    });
    cancelAnimationFrame(doUpdates);
    requestAnimationFrame(doUpdates);
}

function isPending(p) {
    return pendingUpdates.some(q => q[0] === p[0]);
}

function complement(predicate) {
    return x => !predicate(x);
}

function doUpdates() {
    if (0 < pendingUpdates.length) {
        doUpdate(pendingUpdates[0]);
        pendingUpdates.splice(0, 1);
        requestAnimationFrame(doUpdates);
    }
}

function doUpdate(pair) {
    const savedAt = xVar.at;
    watching = false;
    console.log('doUpdate', pair[0].label);

    const arrow = pair[0];
    const sheet = pair[1];
    sheet.clear();
    sheet.drawGrid();
    sheet.ctx.strokeStyle = 'black';
    let f;
    if (arrow.op === sh.variableOp) {
        const c = arrow.at;
        f = z => c;
    } else {
        f = z => {
            xVar.at = z;
            quiver.onMove();
            return arrow.at;
        }
    }
    drawMap(sheet, f, 0.05, 15);

    xVar.at = savedAt;     // XXX ugh hack
    quiver.onMove();
    watching = true;
}

function drawMap(sheet, f, vectorScale, spacing) {
    const ctx = sheet.ctx;
    ctx.globalAlpha = 0.25;
    const height = sheet.canvas.height;
    const width  = sheet.canvas.width;
    for (let y = 0; y < height; y += spacing) {
        for (let x = 0; x < width; x += spacing) {
            const z = sheet.pointFromXY({x: x, y: y});
            drawStreamline(sheet, z, f, vectorScale);
        }
    }
}

function drawStreamline(sheet, z, f, vectorScale) {
    const ctx = sheet.ctx;
    const scale = sheet.scale;
    const nsteps = 10;
    for (let i = 0; i < nsteps; ++i) {
        ctx.lineWidth = (nsteps-i) * 0.5;
        const dz = cnum.rmul(vectorScale/nsteps, f(z));
        if (1 && scale*0.03 < cnum.magnitude(dz)) {
            // We going too far and might end up with random-looking
            // sharp-angled paths. Stop and let this streamline get
            // approximately filled in from some other starting point.
            break;
        }
        const z1 = cnum.add(z, dz);

        ctx.beginPath();
        ctx.moveTo(scale*z.re, scale*z.im);
        ctx.lineTo(scale*z1.re, scale*z1.im);
        ctx.stroke();

        z = z1;
    }
}
