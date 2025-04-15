import * as PImage from "pureimage";
import { PassThrough } from "node:stream";
import { createHash } from "node:crypto";
function hashSeed(input) {
    return createHash("sha256").update(input).digest();
}
function rand(seed, index) {
    return seed[index % seed.length] / 255;
}
async function returnBuffer(img) {
    const stream = new PassThrough();
    const chunks = [];
    stream.on("data", (chunk) => {
        chunks.push(chunk);
    });
    stream.on("end", () => { });
    await PImage.encodePNGToStream(img, stream);
    return Buffer.concat(chunks);
}
function rgb(seed, i) {
    const index = Math.floor(rand(seed, i) * palette.length);
    return palette[index];
}
function applyAlphaToColor(rgb, alpha) {
    const match = rgb.match(/\d+/g);
    if (!match)
        return rgb;
    const [r, g, b] = match.map(Number);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
function drawGlowingTriangle(ctx, x, y, size, color, glowLayers = 2) {
    for (let i = glowLayers; i > 0; i--) {
        const alpha = 0.05 * i;
        const grow = i * 4;
        ctx.fillStyle = applyAlphaToColor(color, alpha);
        ctx.beginPath();
        ctx.moveTo(x, y - size - grow);
        ctx.lineTo(x - size - grow, y + size + grow);
        ctx.lineTo(x + size + grow, y + size + grow);
        ctx.closePath();
        ctx.fill();
    }
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x - size, y + size);
    ctx.lineTo(x + size, y + size);
    ctx.closePath();
    ctx.fill();
}
function drawGlowingSquare(ctx, x, y, size, color, glowLayers = 2) {
    for (let i = glowLayers; i > 0; i--) {
        const alpha = 0.05 * i;
        ctx.fillStyle = applyAlphaToColor(color, alpha);
        const offset = i * 4;
        ctx.fillRect(x - offset, y - offset, size + offset * 2, size + offset * 2);
    }
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
}
function drawGlowingDiamond(ctx, x, y, size, color, glowLayers = 2) {
    for (let i = glowLayers; i > 0; i--) {
        const alpha = 0.05 * i;
        const offset = i * 4;
        ctx.fillStyle = applyAlphaToColor(color, alpha);
        ctx.beginPath();
        ctx.moveTo(x, y - size - offset);
        ctx.lineTo(x + size + offset, y);
        ctx.lineTo(x, y + size + offset);
        ctx.lineTo(x - size - offset, y);
        ctx.closePath();
        ctx.fill();
    }
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size, y);
    ctx.closePath();
    ctx.fill();
}
function drawShape(type, ctx, x, y, size, color, rotation = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    if (type === "square")
        drawGlowingSquare(ctx, 0, 0, size, color);
    else if (type === "triangle")
        drawGlowingTriangle(ctx, 0, 0, size, color);
    else if (type === "diamond")
        drawGlowingDiamond(ctx, 0, 0, size, color);
    ctx.restore();
    if (type === "square")
        drawGlowingSquare(ctx, x, y, size, color);
    else if (type === "triangle")
        drawGlowingTriangle(ctx, x, y, size, color);
    else if (type === "diamond")
        drawGlowingDiamond(ctx, x, y, size, color);
}
export const palette = [
    "#FF9BFE", // rosa
    "#FF8CFF", // rosaSuave
    "#f4f4f4", // branco
    "#1D1D1D70", // preto (translucent)
    "#1d1d1d", // pretoForte
    "#FFCE0F", // amarelo
    "#ffcc2b", // amareloSuave
];
export async function generateAvatar(input, width = 200, height = 200) {
    const img = PImage.make(width, height);
    const ctx = img.getContext("2d");
    const seed = hashSeed(input);
    // Background color
    ctx.fillStyle = rgb(seed, 0);
    ctx.fillRect(0, 0, width, height);
    const shapeTypes = ["square", "triangle", "diamond"];
    const symmetry = 8;
    const angleStep = (2 * Math.PI) / symmetry;
    const cx = width / 2;
    const cy = height / 2;
    for (let i = 0; i < 3; i++) {
        const angle = rand(seed, i) * 2 * Math.PI;
        const radius = rand(seed, i + 1) * (width / 2);
        const size = rand(seed, i + 2) * 20 + 10;
        const color = rgb(seed, i + 3);
        const shape = shapeTypes[Math.floor(rand(seed, i + 4) * shapeTypes.length)];
        for (let j = 0; j < symmetry; j++) {
            const theta = angle + j * angleStep;
            const x = cx + Math.cos(theta) * radius;
            const y = cy + Math.sin(theta) * radius;
            drawShape(shape, ctx, x, y, size, color, theta);
        }
    }
    // Reset alpha
    ctx.globalAlpha = 1.0;
    return await returnBuffer(img);
}
