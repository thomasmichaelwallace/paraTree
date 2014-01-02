// The Parametric Christmas Tree Engineering Game! (paramTree)
// Copyright (C) 2014 Thomas Michael Wallace <http://www.thomasmichaelwallace.co.uk>

// The paraTree is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// The paraTree is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with The paraTree. If not, see <http://www.gnu.org/licenses/>.

// Setup:
//   paraTree depends on the RaphaelJS Library: http://raphaeljs.com/
//   To make it work, stick it on a html page with a <div> of id: holder, and the RaphaelJS script loaded before.

window.onload = function() {

    // Set the stage for this festive offering.
    var height = 600, width = 800, x = 0.5 * width, y = 0.95 * height;
    var maxscale = 40, scale = maxscale / 2.0, minscale = maxscale / Math.pow(2.0, 9);
    var stage = Raphael("holder", width, height);

    // If I were American this would be the colors, as I'm British; here are our Colours.
    var pallette = {
        sky: "#8AC7DE",
        snow : "#F0F0F0",
        leaves: "#D9EB52",
        trunk: "#87796F",
        lights: "#F26B8A",
        sliderfill: "#fff",        
        sliderstroke: "#333",
        buttonfill: "#CC0C39",
        buttonstroke: "#F0F0F0"
    };

    // Renders the background for our snowy satire.
    function background()
    {
        // the sky and the snowy ground.
        var ice = height / 10;
        var sky = height - ice;

        stage.rect(0, 0, width, sky).attr({
            "stroke": pallette.sky,
            "fill": pallette.sky
        });
        stage.rect(0, sky, width, ice).attr({
            "stroke": pallette.snow,
            "fill": pallette.snow
        });

    }

    // Makes a snow storm!
    function letItSnow(flakes, maxspeed, minspeed, size)
    {
        this.snowflakes = stage.set();
        this.snowFalling = false;

        this.flakes = flakes;
        this.maxspeed = maxspeed;
        this.minspeed = minspeed;
        this.size = size;

        // As we've no place to go...
        this.letItSnow = function() {
            this.snowFalling = true;
            for (i = 0; i < this.flakes; i++) {
                if (this.snowFalling) { window.setTimeout( this.firstsnow.bind(this), (this.maxspeed * i / this.flakes)); }
            }                                             
        };

        // Delay the first fall of each snow flake to prevent a deluge at the very start.
        this.firstsnow = function() {
            if (this.snowFalling) {
                // Deal with the corner-case that the snow must fly before it's finished falling.
                var flake = new snow(this.maxspeed, this.minspeed, this.size);
                this.snowflakes.push(flake.flake);
                flake.fall();
            }
        };
        
        // Creates from perpetually falling snow for that winter wonderland feeling.
        function snow(maxspeed, minspeed, size)
        {
            // A snow flake is a circle...
            this.flake = stage.circle(0, 0, 5).attr({
                "stroke": pallette.snow,
                "fill": pallette.snow
            });

            // There are better ways to handle scope, I just didn't know that at the time.
            this.snow = this;
            this.flake.snow = this;
            this.maxspeed = maxspeed;
            this.minspeed = minspeed;
            this.size = size;

            this.fall = function()
            {
                // Update/position snowflake according to scale and random x-position.
                var x = Math.random() * width;                        
                var r = Math.max(Math.min(this.snow.size / 2.0 * scale, 5.0), 2.0);            
                this.snow.flake.attr({
                    "cx": x,
                    "cy": 0.0,
                    "r": r
                });

                // Prepare to fall for random length of time after a random delay.
                var aniattr = { "cy" : height };
                var v = this.snow.minspeed + Math.round(Math.random() * (this.snow.maxspeed - this.snow.minspeed));
                var snowfall = Raphael.animation(aniattr, v, this.snow.fall);
                snowfall.delay(v);

                // Animate and return to fall again.
                this.snow.flake.animate(snowfall);
            };

        }    
        
        this.letItSnow();
    }


    // Create a calculating Christmas Tree.
    function tree(height, thickness, diameter, prop) {

        // global options
        var n = 5;              // The 'definition' of a tree, basically the number of branches; should be odd.

        this.h = height;        // The height of the tree (m).
        this.d = diameter;      // The diameter of the tree branches (m).
        this.t = thickness;     // The diameter of the trunk (m).
        this.p = prop;          // The fullness of the branches (%).

        this.trunk = null;      // The trunk of the tree; just a rectangle when all is said and done.
        this.branches = null;   // The green leaves and branches; just a bunch of rectangles when all's said and done.
        this.lights = null;     // The lights; just a bunch of line-thin rectangles when all's said and done...
        this.outline = null;    // The dotted outlone; just a triangular rectangle when all's said and done.

        this.hslider = null;    // Slider to alter tree height.
        this.dslider = null;    // Slider to alter tree diameter.
        this.tslider = null;    // Slider to alter tree thickness.
        this.pslider = null;    // Slider to alter tree branch density.
       
        // Provides the first-draw of the tree, and subsequent re-draws after animations or scales.
        this.drawTree = function() {

            // Re/draw the trunk of the tree.
            if (this.trunk !== null) { this.trunk.remove(); }
            var tr = (this.t / 2);
            this.trunk = stage.rect(x - (tr * scale), y - (this.h * scale), this.t * scale, this.h * scale).attr({
                "stroke": pallette.trunk,
                "fill": pallette.trunk 
            });

            // Re/draw the dotted tree outline.
            if (this.outline !== null) { this.outline.remove(); }
            var s = this.h / n;
            var dr = (this.d / 2);
            var path = [
                ["M", x - (dr * scale), y - (s * scale)],
                ["L", x, y - (this.h * scale)],
                ["L", x + (dr * scale), y - (s * scale)],
                ["Z"]
            ];
            this.outline = stage.path(path).attr({
                "stroke": pallette.leaves,
                "stroke-width": Math.min(5 * scale, 7),
                "stroke-dasharray": "-",
                "stroke-linejoin": "round"
            });            

            // Re/draw the branches/leaves and lights of the tree.
            if (this.branches !== null) { this.branches.remove(); }
            this.branches = stage.set();
            if (this.lights !== null) { this.lights.remove(); }
            this.lights = stage.set();                        
            var bh = (s * this.p);
            var br = bh / 2.0;
            var zm = this.h - s;
            for (var i = 1 ; i < n; i++)
            {
                var z = (i - 0.5) * s;
                var l = this.d * (z / zm);
                var lr = (l / 2);
                var zh = this.h - z;

                // Tree branches.
                this.branches.push(stage.rect(x - (lr * scale), y - ((zh + br) * scale), l * scale, bh * scale).attr({
                    "stroke": pallette.leaves,
                    "fill": pallette.leaves
                }));

                // Tree lights.
                this.lights.push(stage.path([
                    ["M", x - (lr * scale), y - (zh * scale)],
                    ["L", x + (lr * scale), y - (zh * scale)]
                ]).attr({
                    "stroke": pallette.lights,
                    "stroke-width": Math.min(5 * scale, 10)
                }));
            }

            // Re/draw the sliders last to keep them up-front.
            this.addSliders();
            this.hslider.attr({"cy": y - (this.h * scale)});
            this.tslider.attr({"cx": x - (tr * scale)});
            this.dslider.attr({
                "cx": x - (dr * scale),
                "cy": y - (s *scale)
            });
            var zs = y - ((this.h / 2.0) * scale);            
            if (this.pslider.attr("cy") <= zs) {
                    zs -= br * scale;
            } else {
                    zs += br * scale;
            }
            this.pslider.attr({"cy" : zs});
 
         };

        // Updates the height of the tree.
        this.deltaH = function(height) {
            this.h = height;

            // Update the height of the trunk.
            this.trunk.attr({
                "y": y - (this.h * scale),
                "height": this.h * scale
            });

            // Update the height of the outline.
            var path = this.outline.attr("path");
            var s = this.h / n;
            path[0][2] = y - (s * scale);
            path[1][2] = y - (this.h * scale);
            path[2][2] = y - (s * scale);
            this.outline.attr({"path": path});

            // Update branches and lights to fit.
            var bh = (s * this.p);
            var br = bh / 2.0;
            for (var i = 1 ; i < n; i++)
            {
                var z = (i - 0.5) * s;
                var zh = this.h - z;
                
                // Tree branches
                var branch = this.branches[i - 1];
                branch.attr({
                    "y": y - ((zh + br) * scale),
                    "height": bh * scale
                });

                // Tree lights
                var light = this.lights[i - 1];
                path = light.attr("path");
                path[0][2] = y - (zh * scale);
                path[1][2] = y - (zh * scale);
                light.attr({ "path": path });

            }

            // Update sliders
            this.hslider.attr({"cy": y - (this.h * scale)});
            this.dslider.attr({"cy": y - (s *scale)});
            var zs = y - ((this.h / 2.0) * scale);            
            if (this.pslider.attr("cy") <= zs) {
                    zs -= br * scale;
            } else {
                    zs += br * scale;
            }
            this.pslider.attr({"cy" : zs});
         };

        this.deltaT = function(thickness) {
            this.t = thickness;

            // Update the thickness of the trunk.
            var tr = (this.t / 2);
            this.trunk.attr({
                "x": x - (tr * scale),
                "width": this.t * scale
            });

            // Update sliders.
            this.tslider.attr({"cx": x - (tr * scale)});
        };

        this.deltaD = function(diameter) {
            this.d = diameter;

            // Update the width of the outline.
            var path = this.outline.attr("path");
            var dr = (this.d / 2);
            path[0][1] = x - (dr * scale);
            path[2][1] = x + (dr * scale);
            this.outline.attr({"path": path});

            // Update the width of the branches and lights.
            var s = this.h / n;
            var zm = this.h - s;
            for (var i = 1 ; i < n; i++)
            {
                var z = (i - 0.5) * s;
                var l = this.d * (z / zm);
                var lr = (l / 2);
                
                // Tree branches.
                var branch = this.branches[i - 1];
                branch.attr({
                    "x": x - (lr * scale),
                    "width": l * scale
                });

                // Tree lights.
                var light = this.lights[i - 1];
                path = light.attr("path");
                path[0][1] = x - (lr * scale);
                path[1][1] = x + (lr * scale);
                light.attr({"path": path});
            }

            // Update sliders.
            this.dslider.attr({"cx": x - (dr * scale)});
        };

        this.deltaP = function(prop) {
            this.p = prop;

            // Update tree branches
            var s = this.h / n;
            var bh = (s * this.p);
            var br = bh / 2.0;
            for (var i = 1 ; i < n; i++)
            {
                var z = (i - 0.5) * s;
                var zh = this.h - z;
                
                // Tree branches
                var branch = this.branches[i - 1];
                branch.attr({
                    "y": y - ((zh + br) * scale),
                    "height": bh * scale
                });
            }

            // Update sliders
            var zs = y - ((this.h / 2.0) * scale);            
            if (this.pslider.attr("cy") <= zs) {
                    zs -= br * scale;
            } else {
                    zs += br * scale;
            }
            this.pslider.attr({"cy" : zs});
        };

        this.updateTree = function () {            
            
           
        };
       
        // Draw some slippery sliders.
        this.addSliders = function() {

            var r = 10;
            var sliderattr = {
                "stroke": pallette.sliderstroke,
                "stroke-width": 4,
                "fill": pallette.sliderfill
            };

            if (this.hslider !== null) { this.hslider.remove(); }
            this.hslider = stage.circle(x, 0, r).attr(sliderattr);
            this.hslider.tree = this;
            makeGrabber(this.hslider, h_move, drag_start, "row-resize", "h", 0);

            if (this.dslider !== null) { this.dslider.remove(); }
            this.dslider = stage.circle(0, 0, r).attr(sliderattr);
            this.dslider.tree = this;
            makeGrabber(this.dslider, d_move, drag_start, "col-resize", "d", 0);

            if (this.tslider !== null) { this.tslider.remove(); }
            this.tslider = stage.circle(0, y, r).attr(sliderattr);    
            this.tslider.tree = this;
            makeGrabber(this.tslider, t_move, drag_start, "col-resize", "t", 2);

            if (this.pslider !== null) { this.pslider.remove(); }
            this.pslider =stage.circle(x, 0, r).attr(sliderattr);
            this.pslider.tree = this;
            makeGrabber(this.pslider, p_move, drag_start, "row-resize", "p", 2);
        };

        // Provide lazy slider move functions.
        function drag_start(x, y) {
            this.ox = this.attr("cx");
            this.oy = this.attr("cy");
        }
        function h_move(dx, dy, _mx, _my) {
            var my = this.oy + dy;
            var r = this.attr("r");
            if (my < r) { my = r; }
            if (my > (y - r)) { my = (y - r); }
            this.tree.deltaH((y - my) / scale);
        }
        function d_move(dx, dy, _mx, _my) {
            var mx = this.ox + dx;
            var r = this.attr("r");            
            if ( mx < r ) { mx = r; }
            if ( mx > (x - (this.tree.t / 2.0) * scale)) { mx = x - (this.tree.t / 2.0) * scale; }
            this.tree.deltaD(2.0 * ((x - mx) / scale));            
        }
        function t_move(dx, dy, _mx, _my) {
            var mx = this.ox + dx;
            var rr = this.attr("r") / 2.0;
            if ( mx < (x - (this.tree.d / 2.0) * scale)) { mx = x - (this.tree.d / 2.0) * scale; }
            if ( mx > (x - rr)) { mx = x - rr; }
            this.tree.deltaT(2.0 * ((x - mx) / scale));
        }
        function p_move(dx, dy, _mx, _my) {
            var my = this.oy + dy;
            var sh = ((this.tree.h * scale) / n) / 2.0;
            var sb = y - (this.tree.h / 2.0) * scale;
            if ( my < (sb - sh) ) { my = (sb - sh); }
            if ( my > (sb + sh) ) { my = (sb + sh); }
            this.attr({"cy" : my});
            this.tree.deltaP(Math.abs(my - sb) / sh);
        }

        this.drawTree();
    }        

    function windTunnel() {

        var v = 750;

        // Clear sliders to prevent further changes.
        theUI.clearUI();
        theTree.hslider.remove();
        theTree.pslider.remove();
        theTree.dslider.remove();
        theTree.tslider.remove();

        // Create and test tree object.
        var ok = ECTree(theTree.h, theTree.t, (theTree.d / theTree.h) / 2.0, theTree.p, 1);

        // Send the snow flying;
        var snowfly = { transform: "t" + width + ",0" };
        theSnow.snowFalling = false;
        theSnow.snowflakes.stop().animate(snowfly, v, function() {
            theSnow.snowflakes.remove();
            theSnow.letItSnow();
        });

        // Send tom flying!
        var tomfly = { transform: "t" + (1.1 * width) + ",0r180" };
        theTom.me.animate(tomfly, v * 1.5, function() { theUI.showResults(ok); });

        // Animate failures.
        var aniattr;
        var baniattr = null;
        if (ok.killer) {
            if (ok.fatality == "B") {
                // Bending makes the tree spin and fly away.
                aniattr = { transform: "t" + width + ",0r180" };
            } else if (ok.fatality == "S") {
                // Shear makes the tree shear fly away only.
                aniattr = { transform: "t" + width + ",0r180" };
            } else {
                // Compression makes the tree fall to nothing.
                aniattr = { transform: "s1,0," + x + "," + y };
                baniattr = { transform: "t0," + (y / 1.5) + "r90" };
            }        
            theTree.outline.remove();
            
            if (baniattr !== null) {
                theTree.trunk.animate(baniattr, v);
            } else {
                theTree.trunk.animate(aniattr, v);        
            }

            theTree.branches.animate(aniattr, v);                
            // Show the results at the end of the last animation.
            theTree.lights.animate(aniattr, v);
        }
    }

    function ECTree(h, d, mv, eff, wd) {
        // provide a _basic_ eurocode wind/timber check.
        // please don't use this for design...
        //  - you muppet.
        
        var Shear = 0.0;  // kN
        var Moment = 0.0; // kNm
        var Volume = 0.0; // m^3

        // Basic wind speeds for London (where our Tree is being built...).
        var vb0 = 21.5;     // Basic wind velocity (m/s).
        var cdcs = 1.0;     // Discount seasonal and directional variations (it is Christmas...).
        var vb = vb0 * cdcs;// Factored wind velocity (m/s).

        // Properties of wind
        var rho = 1.25;     // Density of air (height be damned), (kg/m^3).
        var ki = 1.0;       // Turbulence factor (perhaps, it get's a bit shady at this point...).
        var vu = 0.000015;  // Viscosity of air (height, also, be damned), (N/s).

        // Geographical effects for a flat open expanse in London.
        // (Although I appreciate they would have had to have knocked some of the city down).
        var co = 1.0;       // As it is flat, discount orthognay (or whatever...).
        var zmax = 200.0;   // Height at which roughness don't give no damn (m).
        var z0 = 0.01;      // Height at which wind begins (m).
        var kr = 0.19 * Math.pow((z0 / 0.05), 0.07);
                            // Roughness coefficient at an arbitary height.
        var sigmaka = 1.0;  // Assume worst-case for end-effects.
        var cp0a = -1.5;    // Pressure coefficients for three different Reynolds numbers!
        var rea = 100000000;
        var cp0b = -1.9;
        var reb = 20000000;
        var cp0c= -2.2;
        var rec = 5000000;

        // Geometric constants
        var n = 10;         // Number of segments to caculate effects for.
        var I = (h / n);    // Height of each segment.
        var z = I * 0.5;    // Height to begin calculation for (mid-point of first segment), (m).
        var aD = Math.PI * d * I;
                            // Exposed trunk area (m^2). 

        // Segment specific values.
        for (var i = 0; i < n; i++)
        {
            var cr = kr * Math.log(Math.min(z, zmax) / z0);
                            // Roughness coefficient at this arbitary height.
            var vmz = vb * cr * co;
                            // Mean wind speed at height (m/s).
            var sigmav = vb * kr * ki; 
                            // Wind stress (?!) at height (m/s).
            var Iv = sigmav / vmz;
                            // Turbulence stress at height (-).
            var qp = (1 + 7.0 * Iv) * 0.5 * rho * Math.pow(vmz, 2.0);
                            // Gust speed at height (m/s).
            var hdash = h - z;
                            // Height from the top of the tree to segment mid-point (m).
            var b = mv * hdash * 2.0;
                            // Branch width at segment mid-point (m).
            var bdash = d + b;
                            // Full tree width at segment mid-point (m).
            var vre = Math.sqrt(2.0 * qp / rho);
                            // Reynolds wind velocity (because it's different, obviously...), (m/s).
            var re = bdash * vre / vu;
                            // Reynolds number of the wind at the segment mid-point.
            var cp0;        // Reynolds number dependent pressure coefficient.
            if (re > rea) {
                cp0 = cp0a;
            } else if (re > reb ) {
                cp0 = cp0b;
            } else {
                cp0 = cp0c;
            }
            var cpe = cp0 * sigmaka;
                            // Effective pressure coefficient.
            var we = qp * cpe;
                            // Wind pressure at segment mid-point (N/m^2).
            var P = -we;    // Pushing pressure at segement mid-point (N/m^2).
            var A = bdash * I * Math.PI;
                            // Cylindrical wind area of segment (Not right: Good-old surveyor's formulae), (m^2).
            var Adash = (A * eff) + (aD * (1 - eff));
                            // Effective surface area of segment (m^2).
            var Vdash = Adash * bdash / 4.0;
                            // Effective volume of segment (m^3).
            var F = P * Adash;
                            // Wind force on segment (N).
            var Fdash = F / 1000.0;
                            // Wind force on segment (deja-vous...), (kN).
            var M = Fdash * z;
                            // Moment from segment (kNm).
            
            // Append contributions.
            Shear += Fdash;
            Moment += M;
            Volume += Vdash;             

            z += I;         // Jump to mid-point of next segment.
        }

        // Timber properties (the Timbre, if you will...)
        var rhodash = 480;  // Density of all wood in the universe (kg/m^3).
        var rhow = rhodash * 10;
                            // Bulk unit weight of all wood in the universe (kN/m^3).
        var kcr = 0.67;     // Perpen-parallel grain fudge factor.
        
        // Specific timer properties (the Spector, if you will...)
        // Values as bending (N/mm^2), compressive (N/mm^2) and shear (N/mm^2) strengths; notional cost (£/unit). 
        // Wood type 1: Expensive Glulam...
        var wB1 = 32, wC1 = 29, wS1 = 3.8, wP1 = 220;
        // Wood type 2: Cheap Glulam...
        var wB2 = 28, wC2 = 24, wS2 = 2.7, wP2 = 150;
        // Wood type 3: Solid Wood...
        var wB3 = 24, wC3 = 21, wS3 = 2.5, wP3 = 140;
        // Wood type 4: Ikea Wood...
        var wB4 = 16, wC4 = 17, wS4 = 1.8, wP4 = 100;

        // Actual timber properties (the Actuator, if you will...)
        // Values as compressive (N/mm^2), shear (N/mm^2), bending (N/mm^2) stresses and notional cost factor (ln£).
        var fvc, fvs, fvb, ncf;
        if (wd == 1) { 
            fvb = wB1;           
            fvc = wC1;
            fvs = wS1;
            ncf = wP1;        
        } else if (wd == 2) {
            fvb = wB2;           
            fvc = wC2;
            fvs = wS2;
            ncf = wP2;        
        } else if (wd == 3) {
            fvb = wB3;           
            fvc = wC3;
            fvs = wS3;
            ncf = wP3;        
        } else {
            fvb = wB4;           
            fvc = wC4;
            fvs = wS4;
            ncf = wP4;
        }

        // Geometrical properties.
        var y = d * 1000 / 2;
                            // Lever length of our tree (coincidently the radius of the trunk), (mm).
        var beff = 2 * y * kcr;
                            // Effective width of trunk for shear (mm).        
        var Ir = Math.PI * 0.25 * Math.pow(y, 4.0);
                            // Second moment of area of the trunk (mm^4).
        var Z = Ir / y;     // First and a half moment of area of the trunk (mm^3).

        // Utilisations.
        var Pc = Volume * rhow;
                            // Weight of our tree at the very base (N).
        var sigmapc = Pc / (Math.PI * Math.pow(y, 2.0));
                            // Compressive strength at the root of the tree (N/mm^2).
        var uc = sigmapc / fvc;
                            // Compressive utilisation (%).
        var tau = Shear * 1000 / (Math.PI * 0.25 * Math.pow(beff, 2.0));
                            // Shear stress at the root of the tree (N/mm^2).
        var us = tau / fvs; // Shear utilisation (%).
        var sigmamyd = Moment * 1000000 / Z;
                            // Bending stress at inexplicably fixed root of tree (N/mm^2).
        var ub = sigmamyd / fvb;
                            // Bending utilisation (%).
        
        // Design check.
        var killer = false; // true if tree fails and kills everyone.
        var fatality = "";  // failure mode of tree.
        if (ub > 1.0) {
            killer = true;
            fatality = "B";
        } else if (us > 1.0) {
            killer = true;
            fatality = "S";            
        } else if (uc > 1.0) {
            killer = true;
            fatality = "C";
        }

        // Costing constants.
        // Cost factors as (a || x' * b) * X ^ (n || x' / m)
        var hha = 1.75;     // Happiness and height factors.
        var hhm = 10000;
        var tha = 2.75;     // Happiness and thickness factors.
        var thm = 100;
        var vha = 2.20;     // Happiness and volume factors.
        var vhn = 0.75;
        var vcb = 2.0;      // Cost and volume factors.
        var vcn = 0.20;
        var scg = 1000000;  // Scrouge McDuck factor- makes pounds into millions!
        var joy = 300;      // The maximum amount of joy the average person can take.

        // Costing variants.
        var hhn = h / hhm;  // Make taller trees preferable.
        var thn = ncf / thm;// Make expensive wood less preferable.
        var vca = Math.pow(thn, vcb);
                            // Make expensive wood more expensive.
        var utl;
        if (killer) {
            utl = -1;       // Happiness turns into sadness if your tree kills people.
        } else {
            utl = 1;
        }

        // Scoring.
        var hpy = utl * (hha * Math.pow(h, hhn) + (vha * Math.pow(Volume, vhn) / (tha * Math.pow(d, thn))));
                            // Happiness is a state of height * volume over trunk diameter (units/joy).
        var cst = vca * Math.pow(Volume, vcn);
                            // The cost of a tree is in it's volume, as the addage goes (cost/scrouge).
        
        // Reportable/repeatable values.
        var happiness =  hpy / joy;
                            // Happiness as a percentage of pure joy.
        var cost = cst * scg;
                            // Cost of the tree construction (£).
        var gross = hpy * scg;
                            // Money made from happy shoppers / lost from dead shoppers (£).
        var profit = gross - cost;
                            // Earnings from the construction of this tree (£).

        // The object finally returned.
        var summary = {
            "killer": killer,
            "fatality": fatality,
            "happiness": happiness,
            "cost": cost,
            "gross": gross,
            "profit": profit 
        };
        return summary;

    }

    function ui() {

        this.scaffold = stage.set();
        this.zoomin = stage.set();
        this.zoomout = stage.set();

        this.drawUI = function() {

            this.scaffold.push(stage.rect(10, 10, 160, 70, 5).attr({
                "fill": pallette.lights,
                "stroke": pallette.sliderfill,
                "stroke-width": 4
            }));
            this.scaffold.push(stage.text(90, 45, "Remove The\nScaffold!").attr({
                "font-size": 25,
                "fill": pallette.sliderfill
            }));
            makeButton(this.scaffold, windTunnel);

            var zoomattr = {
                "fill": pallette.sliderfill,
                "stroke": pallette.sliderstroke,
                "stroke-width": 4
            };            
            this.zoomin.push(stage.circle(width - 35, 35, 25).attr(zoomattr));
            this.zoomout.push(stage.circle(width - 35, 95, 25).attr(zoomattr));
            var zoomtextattr = {
                "font-size": 50
            };
            this.zoomin.push(stage.text(width - 35, 35, "+").attr(zoomtextattr));
            this.zoomout.push(stage.text(width - 35, 92, "-").attr(zoomtextattr));

            makeButton(this.zoomin, zoomin);
            makeButton(this.zoomout, zoomout);            
            
        };

        this.clearUI = function() {
            this.scaffold.hoverglow.remove();
            document.body.style.cursor = "default";
            this.scaffold.remove();            
            this.zoomin.hoverglow.remove();
            this.zoomin.remove();
            this.zoomout.hoverglow.remove();
            this.zoomout.remove();
        };        

        this.messageset = null;
        this.showResults = function(ECResults) {
            
            var dz = 30;
            var sz = 1.2 * dz;
            var nz = 5;
            var tz = (nz + 1) * dz + (nz - 1) * sz;
            
            var rw = (0.6 * width);
            var rh = tz + (2.0 * dz);
            var rx = x - (rw / 2.0);
            var ry = (height / 2.0) - (rh / 2.0);

            var z = ry + 1.5 * dz;

            this.messageset = stage.set();

            var rectattr;
            if (ECResults.killer || (ECResults.profit < 0)) {
                rectattr = {
                    "fill": pallette.lights,
                    "stroke": pallette.snow,
                    "stroke-width": 5
                };
            } else {
                rectattr = {
                    "fill": pallette.leaves,
                    "stroke": pallette.trunk,
                    "stroke-width": 5
                };
            }
            this.messageset.push(stage.rect(rx, ry, rw, rh).attr(rectattr));

            var resultsattr = {
                "font-size": 20,
                "font-weight": "bold",                
            };
            var messagesattr = {
                "font-size": 20
            };

            var message;
            var result;
            if (ECResults.killer) {
                if (ECResults.fatality == "B") {
                    message = "Your Tree Failed in Bending";
                    result = "Spiralling Into A School And Killing Millions.";
                } else if (ECResults.fatality == "S") {
                    message = "Your Tree Failed in Shear";
                    result = "Destroying A Hospital For Millions of Veterans.";            
                } else if (ECResults.fatality == "C") {
                    message = "Your Tree Failed in Compression";
                    result = "Crushing Millions Of Carol Singing Orphans.";
                }                
            } else {
                message = "Your Tree Survived The Storm!";
                if (ECResults.profit > 0) {
                    result = "Everybody Loves You And You're Super Rich!";
                } else {
                    result = "But Your Business Has Liquidated.";
                }
            }
            this.messageset.push(stage.text(x, z, message).attr(messagesattr));
            z += dz;
            this.messageset.push(stage.text(x, z, result).attr(resultsattr));
            z += sz;

            var cost = ECResults.cost.toFixed(2);
            this.messageset.push(stage.text(x, z, "Costing").attr(messagesattr));
            z += dz;
            this.messageset.push(stage.text(x, z,"£" + cost).attr(resultsattr));            
            z += sz;

            var happiness = (ECResults.happiness * 100.0);
            message = "Making The Children";
            if (happiness < 0) {
                result = (-happiness).toFixed(0) + "% Sad";
            } else {
                result = happiness.toFixed(0) + "% Happy";
            }
            this.messageset.push(stage.text(x, z, message).attr(messagesattr));
            z += dz;
            this.messageset.push(stage.text(x, z, result).attr(resultsattr));
            z += sz;

            var gross = ECResults.gross;
            if (gross < 0) {
                message = "Leading To A Decrease In Shopping Sales Of";
                result = "£" + (-gross).toFixed(2);
            } else {
                message = "Leading To An Increase In Shopping Sales Of";
                result = "£" + gross.toFixed(2);
            }
            this.messageset.push(stage.text(x, z, message).attr(messagesattr));
            z += dz;
            this.messageset.push(stage.text(x, z, result).attr(resultsattr));
            z += sz;

            var profit = ECResults.profit;            
            if (profit < 0) {
                message = "Resulting In A Crippling Lost Of";
                result = "£" + (-profit).toFixed(2);
            } else {
                message = "Resulting In A Tidy Profit Of";
                result = "£" + profit.toFixed(2);
            }
            this.messageset.push(stage.text(x, z, message).attr(messagesattr));
            z += dz;
            this.messageset.push(stage.text(x, z, result).attr(resultsattr));
            z += sz;

            makeButton(this.messageset, this.hideResults);
        
        };

        this.hideResults = function() {
            theUI.messageset.hoverglow.remove();
            document.body.style.cursor = "default";
            theUI.messageset.remove();            
            reboot();
        };

        this.drawUI();

    }

    // UI helper methods.
    function applyHover(element) {
        element.hoverglow = element.glow();
        element.hoverglow.hide();
        element.mouseover( function() { element.hoverglow.show(); });
        element.mouseout( function() { element.hoverglow.hide(); });
    }
    function applyPointer(element, pointer) {
        element.mouseover( function() { document.body.style.cursor = pointer; } );
        element.mouseout( function() { document.body.style.cursor = 'default'; } );                    
    }
    function applyAll(element, pointer) {
        applyHover(element);
        applyPointer(element, pointer);
    }
    function makeButton(button, clicker) {
        if (clicker !== null) { button.click(clicker); }
        applyAll(button, "pointer");
    }
    function makeGrabber(grabber, mover, starter, pointer, valuer, dp) {
        applyPointer(grabber, pointer);
        grabber.valuer = valuer;
        grabber.uiValue = uiValue;
        grabber.dp = dp;
        if (mover !== null) { grabber.drag(mover, starter, grabber.uiValue); }
    }

    // Show the value of a slider, so that people can see how stupid this is.
    function uiValue() {
        var tx = this.attr("cx");
        var ty = this.attr("cy");
        var tr = this.attr("r");
        var valueattr = {
            "font-size": 15,
            "text-anchor": "start"
        };
        var hideattr = {
            "opacity": 0
        };
        var valuetext;
        if (this.valuer == "p") {
            valuetext = this.valuer + " = " + (this.tree[this.valuer].toFixed(this.dp) * 100) + "%";
        } else {
            valuetext = this.valuer + " = " + this.tree[this.valuer].toFixed(this.dp) + "m";
        }
        var uiText = stage.text(tx + 2.0 * tr, ty + 2.0 * tr, valuetext).attr(valueattr);
        uiText.animate(hideattr, 1000, "<", function() { this.remove(); });
    }

    // Me! For scale, of course...
    function tom() {
        this.me = stage.set();

        this.drawTom = function() {
            this.me.remove();
            var tx = x / 40.0;          // Start close to the edge.

            var th = 1.68;              // Fun fact: I am 5' 6''.
            var tw = th / 4.2;          // I enjoy a 1:4.2 ratio of height to width.
            var tr = tw / 2.0;          // With a radius of half that.
            var tl = th / 1.8;          // A 1.8:1 ratio of legs to total height.
            var tf = th / 5.6;          // My face is roughly 0.18 of my height.
            var tb = th - (tl + tf);    // What isn't my face or legs is my body...
            var tm = x - (tx * scale);  // My mid-point in relation to the tree.

            var path = [
                ["M", tm, y - (tl * scale)],                    // Starting at the crutch of the matters,
                ["L", tm - (tr * scale), y],                    // And down my left leg,
                ["M", tm + (tr * scale), y],                    // Jumping to the right foot,
                ["L", tm, y - (tl * scale)],                    // Riding up the leg to the, um...,
                ["L", tm, y - ((tl + tb) * scale)],             // Following my treasure trail up to the neck,
                ["L", tm - (tr * scale), y - (tl * scale)],     // With a surprise diversion to my left hand,
                ["M", tm + (tr * scale), y - (tl * scale)],     // And a hope to my right hand,
                ["L", tm, y - ((tl + tb) * scale)]              // Throwing in the right arm for free.
            ];            
            this.me.push(
                stage.path(path).attr({
                    "stroke": pallette.sliderstroke,
                    "stroke-width": 2
                })            
            );
            // Making the head a circle is easier than a path.
            // This does, however, make the head fly away seperately.
            // Initially I thought of this as a bug, however it grows on you as a joke...
            this.me.push(
                stage.circle(tm, y - ((tl + tb + tr) * scale), (tr * scale)).attr({
                    "fill": pallette.sliderfill,
                    "stroke": pallette.sliderstroke,
                    "stroke-width": 2
                })
            );

            // Some Being Brunel marketing, for all those cool kids out there.
            theBrunel.remove();
            theBrunel = stage.image("/games/tree/js/bblogo.png", width - 290, (height * 9.0 / 10.0) + 5, 284, 50);
            applyPointer(theBrunel, 'pointer');
            theBrunel.click(beingbrunel);
            function beingbrunel() {
                window.open("http://www.beingbrunel.com", "_blank");
            }
        
        };

        this.drawTom();

    }


    // Provide the telescopic action!
    function zoomin(){
        if (scale < maxscale) {
            scale = scale * 2.0;        
        }
        reboot();
    }
    function zoomout(){
        if (scale > minscale) {
            scale = scale / 2.0;
        }
        reboot();
    }
    function reboot(){
        theTree.drawTree();
        theTom.drawTom();
        theUI.clearUI();
        theUI.drawUI();
    }


    // Generate the background/constants.
    background();

    // Start it snowing.
    var theSnow = new letItSnow(20, 10000, 5000, 0.5);

    // Construct the first tree.
    var theTree = new tree( 10, 1, 3, 0.5 );    

    // Draw the UI
    var theUI = new ui();    

    // Add Tom and Being Brunel logo.
    var theBrunel = stage.rect(0,0,0,0);
    var theTom = new tom(); 

};
