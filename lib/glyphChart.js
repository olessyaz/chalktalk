
function GlyphChart() {
   this.glyphsPerCol = 10;
   this.t = 0;
   this.iDragged = 0;
   this.isDragging = false;
   this.strokeCountMask = 0;
}

GlyphChart.prototype = {
   setStrokeCountBit : function(b, state) {
      if (state)
         this.strokeCountMask |= 1 << b;
      else
         this.strokeCountMask ^= 1 << b;
   },
   colWidth : function() {
      return height() / this.glyphsPerCol * .89;
   },
   color : function() {
      return backgroundColor == 'white' ? 'rgb(0,100,200)'       : 'rgb(128,192,255)' ;
   },
   scrim : function() {
     return backgroundColor == 'white' ? 'rgba(128,192,255,.5)' : 'rgba(0,80,128,.5)';
   },
   bounds : function(i) {
      var ht = height() / this.glyphsPerCol;
      var x = this.colWidth() * (0.05 + floor(i / this.glyphsPerCol)) - _g.panX;
      var y = ((i % this.glyphsPerCol) * height()) / this.glyphsPerCol + ht * .1 - _g.panY;
      return [ x, y, x + ht * .75, y + ht * .85 ];
   },
   draw : function() {
      _g.save();
      _g.globalAlpha = 1.0;

      color(bgScrimColor(.5));
      fillRect(-_g.panX - 100, 0, width() + 200 - _g.panY, height());

      _g.textHeight = floor(8 * height() / 800);
      _g.font = _g.textHeight + 'pt Arial';

      this.t = this.isDragging
                 ? this.iDragged + 0.99
                 : this.glyphsPerCol * (floor( (sketchPage.mx + _g.panX) / this.colWidth() ) +
                                   max(0, _g.panY + min(.99, sketchPage.my / height())));

      for (var i = 0 ; i < glyphs.length ; i++)
         this.drawGlyph(i);

      if (this.isDragging)
         this.drawGlyph(this.iDragged, This().mouseX, This().mouseY);

      _g.restore();
   },
   drawGlyph : function(i, cx, cy) {
      var mx = This().mouseX, my = This().mouseY;
      var glyph = glyphs[i];
      var nn = glyph.data.length;
      var b = this.bounds(i);
      var gX = b[0], gY = b[1], gW = b[2]-b[0], gH = b[3]-b[1];
      if (isDef(cx)) {
         gX += cx - (b[0] + b[2]) / 2;
         gY += cy - (b[1] + b[3]) / 2;
      }
      var x = gX + (height()/this.glyphsPerCol) * .1;
      var y = gY;
      var t = this.t;
      var txt = glyphs[i].indexName;
      var isSelected = mx >= b[0] && my >= b[1] && mx < b[2] && my < b[3];
      var isHighlighted = isSelected || (this.strokeCountMask & 1 << nn) != 0;
      var gR = 4;
      var sc = height() / 2000 * 10 / this.glyphsPerCol;
      var n, d, j;

      color(this.scrim());
      fillPolygon(createRoundRect(gX, gY, gW, gH, gR));

      lineWidth(0.5);
      color(this.color());
      if (backgroundColor == 'white') {
         line(gX + gW, gY + gH - gR, gX + gW, gY + gR);
         line(gX + gW - gR, gY + gH, gX + gR, gY + gH);
         var rx = gX + gW - gR + .707 * gR;
         var ry = gY + gH - gR + .707 * gR;
         line(gX + gW - gR, gY + gH, rx, ry);
         line(gX + gW, gY + gH - gR, rx, ry);
      }
      else {
         line(gX + gR, gY, gX + gW - gR, gY);
         line(gX, gY + gR, gX, gY + gH - gR);
         var rx = gX + gR - .707 * gR;
         var ry = gY + gR - .707 * gR;
         line(gX + gR, gY, rx, ry);
         line(gX, gY + gR, rx, ry);
      }

      _g.strokeStyle = _g.fillStyle = isHighlighted ? defaultPenColor : this.color();
      _g.lineWidth = isHighlighted ? 2 : 1;

      _g_text(txt, [gX + 2, y + 11.5, 0]);

      y += height() / 45 * 10 / this.glyphsPerCol;

      for (n = 0 ; n < nn ; n++) {
         d = glyph.data[n];
         if (isSelected && mix(i, i+1, n / nn) <= t)
            fillOval(x + d[0][0] * sc - 3, y + d[0][1] * sc - 3, 6, 6);

         _g_beginPath();
         _g_moveTo(x + d[0][0] * sc, y + d[0][1] * sc);
         for (j = 1 ; j < d.length ; j++) {
            if (isSelected && mix(i, i+1, (n + j / d.length) / nn) > t)
               break;
            _g_lineTo(x + d[j][0] * sc, y + d[j][1] * sc);
         }
         _g_stroke();
      }
   },
}

var glyphChart = new GlyphChart();

