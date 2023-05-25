onLoading(() => {
  // Black background
  drawRect({
    width: width(),
    height: height(),
    color: rgb(0, 0, 0),
  });

  // A pie representing current load progress
  drawCircle({
    pos: center(),
    radius: 32,
    end: map(progress, 0, 1, 0, 360),
  });

  drawText({
    text: "loading" + ".".repeat(wave(1, 4, time() * 12)),
    font: "monospace",
    size: 24,
    anchor: "center",
    pos: center().add(0, 70),
  });
});
