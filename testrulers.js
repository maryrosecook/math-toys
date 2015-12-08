'use strict';

const sh = mathtoys.ruler;

let quiver;                     // for debug

function onLoad() {
    return tempTest();
    quiver = sh.makeQuiver();
    const ui = sh.makeRulerUI(quiver, canvas, {}, {});
    ui.show();
}

function tempTest() {
    const ruler = sh.makeRulers(canvas);
    ruler.drawGrid();
    ruler.ctx.lineWidth = 1;
    ruler.ctx.strokeStyle = 'black';
    ruler.ctx.fillStyle = 'blue';
    ruler.drawDot(1, 3);
    ruler.drawLine(1, 2);

    return;

    const i = quiver.add({op: sh.constantOp, at: {re: 0, im: 1}});
    ruler.drawDot(i.at, sh.dotRadius);
    ruler.drawText(i.at, i.label, i.op.labelOffset);

    const v = quiver.add({op: sh.variableOp, at: {re: 2.1, im: -1}});
    ruler.drawDot(v.at, sh.dotRadius);
    ruler.drawText(v.at, v.label, v.op.labelOffset);
}
