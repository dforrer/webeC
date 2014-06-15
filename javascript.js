// FORRER: siteUrl cannot end in "/"

var token;

var username;
var secret;

var siteUrl = "http://localhost/webeC";

var browserWidth;

var browserHeight;

// FORRER: Identifies the presentation that the user is currently watching
var presNr;

// FORRER: lastAddedSlide = last loaded slide from server
// we need to set this, otherwise if there are no slides at the
// beginning, the new slides won't be loaded,
// because lastAddedSlide will be UNDEFINED!
var lastAddedSlide = 0;

var cont;
var cont2;

// FORRER: Identifies the currently displayed slide
var displayedSlide = 0;

// FORRER: AJAX-Request
var xmlgetCurrSlide;

/*
 * FORRER: Über den updateMode unterscheiden wir, ob der User geswiped hat oder
 * nicht. 1 bedeutet Update-Mode = wir springen immer zum neusten slide 0
 * bedeutet Swipe-Mode
 */
var updateMode = 1;

var topSlider = new Array();
var items = new Array();

var isTouchSupported;
var startEvent;
var moveEvent;
var endEvent;

// ------------------------------------------------------------
// FUNCTIONS
// ------------------------------------------------------------

var timeOut;

function getSVGCircles(color) {
	var shape = document.createElement("svg");
	shape.setAttribute("d", "M 22.5,568 C 26.642136,568 30,564.64215 30,560.5 30,556.35785 26.642136,553 22.5,553 21.13725,553 19.851325,553.37256 18.75,554.0078 20.996208,555.30344 22.5,557.7206 22.499997,560.5 22.5,563.2794 20.996208,565.69655 18.75,566.9922 19.851325,567.62744 21.13725,568 22.5,568 z M 18.75,566.9922 C 16.503793,565.69655 15,563.2794 15,560.5 15,563.2794 13.496207,565.69655 11.25,566.9922 12.351322,567.62744 13.63725,568 15,568 16.36275,568 17.648675,567.62744 18.75,566.9922 z M 11.25,566.9922 C 9.0037942,565.69655 7.5000003,563.2794 7.5000003,560.5 7.5000003,557.7206 9.0037942,555.30344 11.25,554.0078 10.148678,553.37256 8.8627509,553 7.5000003,553 3.3578642,553 0,556.35785 0,560.5 0,564.64215 3.3578642,568 7.5000003,568 8.8627496,568 10.148678,567.62744 11.25,566.9922 z M 11.25,554.0078 C 13.496207,555.30344 14.999999,557.7206 15,560.5 14.999999,557.7206 16.503793,555.30344 18.75,554.0078 17.648673,553.37256 16.36275,553 14.999999,553 13.63725,553 12.351322,553.37256 11.25,554.0078 z");
	shape.setAttribute("style", "stroke:none; fill:#" + color);
	return shape;
}

function getSVGBecken(color, scale) {
	var svg = document.createElement("svg");
	var group = document.createElement("g");
	var path = document.createElement("path");

	path.setAttribute("d", "M 0,1385 0,1392.5001 6.521754,1400 23.478325,1400 30.000079,1392.5001 30.000079,1385 27.391377,1385 27.391377,1392.5001 23.478325,1397.0001 6.521754,1397.0001 2.608702,1392.5001 2.608702,1385 0,1385 z M 3.913052,1388 3.913052,1392.5001 6.521754,1395.5 23.478325,1395.5 26.087026,1392.5001 26.087026,1388 3.913052,1388 z");
	path.setAttribute("style", "stroke:none; fill:#" + color);
	group.setAttribute("transform", "scale(" + scale + ")");

	group.appendChild(path);
	svg.appendChild(group);

	return shape;
}

function openLink(theLink) {
	window.location.href = theLink.href;
}

// FORRER: not used at the moment
function smoothScrollToTop() {
	if (document.body.scrollTop != 0 || document.documentElement.scrollTop != 0) {
		var topPosition = document.body.scrollTop || document.documentElement.scrollTop;
		debug("Topposition:" + topPosition, "override");
		if (topPosition > 0) {
			window.scrollBy(0, -13);
		} else {
			window.scrollBy(0, 13);
		}
		timeOut = setTimeout('smoothScrollToTop()', 10);
	} else {
		clearTimeout(timeOut);
	}
}

function debug(tmp, arg) {
	return;
	if (arg == "override") {
		document.getElementById('info').innerHTML = tmp;
	} else if (arg == "append") {
		document.getElementById('info').innerHTML += '</br>' + tmp;
	}
}

function reorderAlerts(itemArray) {
	itemArray.sort(compareAlertlevel);
	itemArray.sort(compareState);
	var offset = 0;
	for ( i = 0; i < itemArray.length; i++) {
		itemArray[i].setTopOffset(offset);
		itemArray[i].setVerticalPosition(offset, 400);
		offset += itemArray[i].getDivsuper().offsetHeight;
	}
}

function updateAlertsHeight(itemArray) {
	var h = 0;
	for ( i = 0; i < itemArray.length; i++) {
		h += itemArray[i].getDivsuper().offsetHeight;
	}
	document.getElementById('alerts').style.height = h + 'px';

}

// Custom sort-function for Array.sort(compare);
function compareDate(a, b) {
	if (a.getState() == 'undone' && b.getState() == 'done') {
		return -1;
	}
	if (a.getState() == 'done' && b.getState() == 'undone') {
		return 1;
	}

	return 0;
}

// Custom sort-function for Array.sort(compare);
function compareState(a, b) {
	if (a.getState() == 'undone' && b.getState() == 'done') {
		return -1;
	}
	if (a.getState() == 'done' && b.getState() == 'undone') {
		return 1;
	}

	return 0;
}

// Custom sort-function for Array.sort(compare);
function compareAlertlevel(a, b) {
	if (a.getAlertlevel() == 'high' && b.getAlertlevel() == 'medium') {
		return -1;
	}
	if (a.getAlertlevel() == 'medium' && b.getAlertlevel() == 'low') {
		return -1;
	}
	if (a.getAlertlevel() == 'high' && b.getAlertlevel() == 'low') {
		return -1;
	}

	if (a.getAlertlevel() == 'medium' && b.getAlertlevel() == 'high') {
		return 1;
	}
	if (a.getAlertlevel() == 'low' && b.getAlertlevel() == 'medium') {
		return 1;
	}
	if (a.getAlertlevel() == 'low' && b.getAlertlevel() == 'high') {
		return 1;
	}
}

function updateView() {
	for ( i = 0; i < items.length; i++) {
		items[i].getDivsuper().removeEventListener('webkitTransitionEnd', updateView, false);
	}
	setTimeout(function() {
		updateAlertsHeight(items);
		reorderAlerts(items);
	}, 500);

}

/**
 * Klasse für ein Slider Objekt, das die Grösse des ganzen Bildschirms hat und
 * auf Touchinputs hört.
 */

function slider(id) {
	var id = id;

	// Touch-Variablen
	var touchstarted = false;
	var startX = 0;
	var startY = 0;
	var distanceX = 0;
	var distanceY = 0;
	var posY = 0;
	var timerCounter = 0;
	var timer = 0;
	var touchBox = document.createElement('div');
	var contentBox = document.createElement('div');
	touchBox.setAttribute('class', 'touchBox');
	contentBox.setAttribute('class', 'contentBox');
	touchBox.setAttribute('id', id);
	touchBox.appendChild(contentBox);

	document.body.appendChild(touchBox);

	this.setContent = function(content) {
		contentBox.innerHTML = content;
	}
	
	this.setBackgroundColorContentBox = function (color){
		contentBox.style.backgroundColor = "#"+color;
	}

	this.init = function() {
		// Listener hinzufügen
		touchBox.addEventListener(startEvent, this.startHandler, false);
		touchBox.addEventListener(moveEvent, this.moveHandler, false);
		touchBox.addEventListener(endEvent, this.endHandler, false);

		touchBox.style.webkitTransitionDuration = 0 + "ms";
		touchBox.style.webkitTransitionTimingFunction = "cubic-bezier(.42,0,.58,1)";
		touchBox.style.webkitTransform = "translate3d(0, " + ((-1) * window.innerHeight) + "px, 0)";
	}

	this.slideIn = function(ms) {
		slideIn(ms);
	}

	this.slideOut = function(ms) {
		slideOut(ms);
	}
	function slideIn(ms) {
		touchBox.style.webkitTransitionDuration = ms + "ms";
		touchBox.style.webkitTransitionTimingFunction = "cubic-bezier(.42,0,.58,1)";
		touchBox.style.webkitTransform = "translate3d(0, 0, 0)";
		// Here we manually trigger a reflow of the page
		debug("needed", "append");
	}

	function slideOut(ms) {
		debug("slideIn", "append");
		touchBox.style.webkitTransitionDuration = ms + "ms";
		touchBox.style.webkitTransitionTimingFunction = "cubic-bezier(.42,0,.58,1)";
		touchBox.style.webkitTransform = "translate3d(0," + ((-1) * window.innerHeight) + "px, 0)";
		// Destroying the slider-Object
		setTimeout(function() {
			document.body.removeChild(touchBox);
			topSlider.pop();
		}, 400);

	}


	this.startHandler = function(event) {
		debug("startHandler", "append");
		touchstarted = true;

		// FORRER: Increase timerCounter by 1 every 10 miliseconds.
		timer = setInterval(function() {
			timerCounter++;
		}, 10);
		debug(timer, "append");
		// FORRER: get start position
		startX = event.touches[0].pageX;
		startY = event.touches[0].pageY;

	}

	this.moveHandler = function(event) {
		// FORRER: Prevents the window from scrolling
		event.preventDefault();

		if (touchstarted == true) {

			distanceX = event.touches[0].pageX - startX;
			distanceY = event.touches[0].pageY - startY;

			/*
			 Rubber Banding à la Apple

			 b = (1.0 – (1.0 / ((x * c / d) + 1.0))) * d
			 where:
			 x = distance from the edge
			 c = constant value, UIScrollView uses 0.55
			 d = dimension, either width or height
			 */

			if (distanceY > 0) {
			/*
				var x = distanceY;
				var c = 0.55;
				var d = 480;
				distanceY = x * c;
				distanceY = distanceY / d;
				distanceY = distanceY + 1.0;
				distanceY = 1.0 / distanceY;
				distanceY = 1.0 - distanceY;
				distanceY = distanceY * d;
				distanceY = distanceY;
			*/
				distanceY = 0;

			}

			// FORRER: move the div along with the movement of the finger
			// translate3d() is hardware-accelarated unlike translateX()!
			// 75ms because when you slide accross the screen,
			// the slides should
			// be glued to your finger!
			touchBox.style.webkitTransitionDuration = 75 + "ms";
			touchBox.style.webkitTransitionTimingFunction = "ease-out";
			touchBox.style.webkitTransform = "translate3d(0," + distanceY + "px,0)";
		}
	}
	// FORRER: moveLeft(), moveRight(), comeBack() need to be defined before we
	// use them
	this.endHandler = function(event) {
		clearInterval(timer);

		posY += distanceY;
		// the following conditions have been discussed in details
		if (distanceY < -100) {
			slideOut(300);
		} else {
			slideIn(300);
		}

		distanceX = 0;
		distanceY = 0;
		timerCounter = 0;
		touchstarted = false;
		// debug("at the end", "append");
	}
}

// This is a draggable Alert-Object
function Container(id, title, icon, text, ackBool, highlightedtext, date, time, instructionsYESNO, instructionsLINK, state, alertlevel, detailLINK) {
	// Object Variables (can't have "this.")
	var id = id;
	var title = title;
	var icon = icon;
	var text = text;
	var ackBool = ackBool;
	var highlightedtext = highlightedtext;
	var date = date;
	var time = time;
	var instructionsYESNO = instructionsYESNO;
	var instructionsLINK = instructionsLINK;
	var alertlevel = alertlevel;
	var state = state;
	var divsuper;
	var content;
	var left;
	var right;
	var topOffset;

	var n = date.split(".");
	var m = time.split(":");
	var dateObject = new Date(n[2], n[1], n[0], m[0], m[1], 0, 0);

	var touchstarted = false;
	var startX = 0;
	var startY = 0;
	var distanceX = 0;
	var distanceY = 0;
	var timerCounter = 0;
	var timer = 0;

	this.getDiv = function() {
		return content;
	}
	this.getState = function() {
		return state;
	}
	this.getAlertlevel = function() {
		return alertlevel;
	}
	this.getDivsuper = function() {
		return divsuper;
	}
	this.getTopOffset = function() {
		return topOffset;
	}
	this.setTopOffset = function(val) {
		topOffset = val;
	}
	this.setVerticalPosition = function(topOffset, time) {
		divsuper.style.webkitTransitionDuration = time + "ms";
		divsuper.style.webkitTransitionTimingFunction = "cubic-bezier(.42, 0, .58, 1)";
		divsuper.style.webkitTransform = "translate3d(0," + topOffset + "px, 0)";
	}

	this.add = function(opacity) {
		// divsuper contains three divs: left, content, right
		divsuper = document.createElement('div');
		divsuper.setAttribute('class', 'divsuper');
		divsuper.setAttribute('id', id);

		left = document.createElement('div');
		left.setAttribute('class', 'leftdrag');
		left.innerHTML = "<img id='arrowleft" + id + "' src='pictures/pfeil_left.png?v=1' style='width:42px'/><p style='margin:10px; color: #434343; font-size:14px;'><b>Erledigt?</b></p>";

		right = document.createElement('div');
		right.setAttribute('class', 'rightdrag');
		right.innerHTML = "<img id='arrowright" + id + "' src='pictures/pfeil_right.png?v=1' style='width:42px'/><p style='margin:10px; color: #434343; font-size:14px;'><b>Löschen?</b></p>";

		content = document.createElement('div');

		// Set id, class of content
		content.setAttribute('class', alertlevel);
		content.style.width = window.innerWidth + 'px';
		content.style.opacity = opacity;

		content.innerHTML = getHTMLOfContent();

		divsuper.appendChild(left);
		divsuper.appendChild(content);
		divsuper.appendChild(right);

		document.getElementById('alerts').appendChild(divsuper);
		content.addEventListener(startEvent, this.startHandler, false);
		content.addEventListener(moveEvent, this.moveHandler, false);
		content.addEventListener(endEvent, this.endHandler, false);
		content.addEventListener("click", this.clickHandler, false);

		update();
	}
	function getHTMLOfContent() {
		// Set Content of content
		var table = "<table>";
		table += "<tr>";
		table += "<td style='width:1%'>";
		if (state == 'done') {
			table += "<img class='alerticon' style='opacity:0.5;' src='pictures/" + icon + "_dark.png' />";
		} else {
			table += "<img class='alerticon' src='pictures/" + icon + "_white.png' />";
		}
		table += "</td>";
		table += "<td style='width:98%'>";
		if (state == 'undone') {
			table += "<h1>" + title + "</h1>";
		} else {
			table += "<h2>" + title + "</h2>";
		}
		table += "</td>";
		table += "<td style='width:1%'><p class='dates'>";
		table += date;
		table += "</p></td>";
		table += "</tr>";
		table += "<tr><td style='height:10px'></td></tr>";
		table += "<tr>";
		table += "<td></td>";
		table += "<td style='vertical-align: top' id='text" + id + "'>";
		if (ackBool == true && state == 'undone') {
			table += "<div class='highlight" + alertlevel + "'>";
			table += highlightedtext;
			table += "</div>";
		} else if (ackBool == true && state == 'done') {
			table += "<div class='highlightdone'>";
			table += highlightedtext;
			table += "</div>";
		}
		table += text;
		table += "</td>";
		table += "<td style='vertical-align: top'>";
		table += "<p class='dates'><b>" + time + "</b></p>";
		table += "</td>";
		table += "</tr>";
		table += "</table>";
		return table;
	}

	function update() {
		divsuper.style.width = (160 + 160 + window.innerWidth) + 'px';
		content.style.width = window.innerWidth + 'px';
		content.innerHTML = getHTMLOfContent();
	}


	this.update = function() {
		divsuper.style.width = (160 + 160 + window.innerWidth) + 'px';
		content.style.width = window.innerWidth + 'px';
		content.innerHTML = getHTMLOfContent();
	}
	this.clickHandler = function(event) {
		addSlider(detailLINK);
	}
	this.startHandler = function(event) {
		debug("startHandler", "append");
		touchstarted = true;

		// FORRER: Increase timerCounter by 1 every 10 miliseconds.
		timer = setInterval(function() {
			timerCounter++;
		}, 10);
		debug(timer, "append");
		// FORRER: get start position
		startX = event.touches[0].pageX;
		startY = event.touches[0].pageY;

	}

	this.moveHandler = function(event) {
		if (touchstarted == true) {
			distanceX = event.touches[0].pageX - startX;
			distanceY = event.touches[0].pageY - startY;

			// FORRER: Disable Default Event-Behaviour,
			// if we scroll more vertically, than horizontaly
			var absX = Math.abs(distanceX);
			var absY = Math.abs(distanceY);

			if (absX > absY) {
				// FORRER: Prevents the window from scrolling
				event.preventDefault();

				// FORRER: move the div along with the movement of the finger
				// translate3d() is hardware-accelarated unlike translateX()!
				// 75ms because when you slide accross the screen,
				// the slides should
				// be glued to your finger!
				divsuper.style.webkitTransitionDuration = 75 + "ms";
				divsuper.style.webkitTransitionTimingFunction = "ease-out";
				divsuper.style.webkitTransform = "translate3d(" + distanceX + "px," + topOffset + "px,0)";
			} else {
				divsuper.style.left = '-160px';
			}

			if (distanceX > 160) {
				var arrow = document.getElementById('arrowleft' + id);
				arrow.style.webkitTransitionDuration = "300ms";
				arrow.style.webkitTransform = "rotateZ(-180deg)";
			}
			if (distanceX < 160 && distanceX > 0) {
				var arrow = document.getElementById('arrowleft' + id);
				arrow.style.webkitTransitionDuration = "300ms";
				arrow.style.webkitTransform = "rotateZ(0deg)";
			}
			if (distanceX > -160) {
				var arrow = document.getElementById('arrowright' + id);
				arrow.style.webkitTransitionDuration = "300ms";
				arrow.style.webkitTransform = "rotateZ(0deg)";
			}

			if (distanceX < -160) {
				var arrow = document.getElementById('arrowright' + id);
				arrow.style.webkitTransitionDuration = "300ms";
				arrow.style.webkitTransform = "rotateZ(180deg)";
			}
		}
	}
	function comeBack(bezierVal, time) {
		debug("comeBack", "append");
		divsuper.style.webkitTransitionDuration = time + "ms";
		divsuper.style.webkitTransitionTimingFunction = "cubic-bezier(" + bezierVal + ")";
		divsuper.style.webkitTransform = "translate3d(0, " + topOffset + "px, 0)";
	}

	// FORRER: moveLeft(), moveRight(), comeBack() need to be defined before we
	// use them
	this.endHandler = function(event) {
		clearInterval(timer);

		// debug("distanceX px:"+ distanceX + " per ms: " +
		// (timerCounter),"override");
		var absX = Math.abs(distanceX);
		var absY = Math.abs(distanceY);

		if (absX > absY) {
			// the following conditions have been discussed in details
			if (distanceX > 160) {
				if (state == 'undone') {
					state = 'done';
					content.setAttribute('class', 'done');
				} else {
					state = 'undone';
					content.setAttribute('class', alertlevel);
				}
			} else if (distanceX < -160) {

				if (ackBool == false) {
					ackBool = true;
				} else {
					ackBool = false;
				}
			}
		}
		update();
		comeBack(".42, 0, .58, 1", 400);

		divsuper.style.left = '-160px';
		divsuper.addEventListener('webkitTransitionEnd', updateView, false);

		distanceX = 0;
		distanceY = 0;
		timerCounter = 0;
		touchstarted = false;
		// debug("at the end", "append");
	}
}

function addSlider(link) {
	var slide = new slider();
	slide.init();

	// AJAX-Request
	var xhr = new XMLHttpRequest();
	xhr.open('GET', link, true);
	xhr.onreadystatechange = function() {
		if (this.readyState !== 4)
			return;
		if (this.status !== 200)
			return;
		// or whatever error handling you want
		slide.setContent(this.responseText);
		setTimeout(function() {
			slide.slideIn(300);
		}, 200);
		topSlider.push(slide);
	};
	xhr.send();
}



function getToken()
{

}



function checkCookie() 
{
	token = getCookie("token");

    if ( token != "") 
    {
		// TODO: Load new items
		
    }
    else
    {
      	secret = prompt("Enter your secret:", "");
        if (secret != "" && secret != null) 
        {
			// AJAX-Request to getToken
			var xhr = new XMLHttpRequest();
			xhr.open('POST', getToken.php, true);
			xhr.onreadystatechange = function() {
				if (this.readyState !== 4)
				{
					return;
				}
				if (this.status !== 200)
				{
					return;
				}
				// Do something here
				data.resp = JSON.parse(x.responseText);
        		if(data.resp.status=='success'){
        		    alert('That worked!');
    		    }else{
		            alert('That didn\'t work!');
		        }
			};
			xhr.send();		
        }
    }
}



function setCookie(cname, cvalue, exdays) 
{
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toGMTString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}



function getCookie(cname) 
{
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) 
    {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}



function init() {

	isTouchSupported = 'ontouchstart' in window;
	startEvent = isTouchSupported ? 'touchstart' : 'mousedown';
	moveEvent = isTouchSupported ? 'touchmove' : 'mousemove';
	endEvent = isTouchSupported ? 'touchend' : 'mouseup';

	// FORRER: Set slide-dimensions
	browserWidth = window.innerWidth;

	// Check Login
	//-------------
	checkCookie();


	// Elemente initialisieren
	var item1 = new Container(1, 'Einkaufen', 'high', '<p><i>Biologie</i> - Fällmittelpumpe 3 ist ausgefallen.</p>', false, 'quittiert durch M. Muster', '12.05.13', '19:56', false, null, 'undone', 'high', 'detail1.html');

	var item2 = new Container(2, 'Chemie', 'medium', '<p><i>Becken 3</i> - Die Phosphatwerte sind erhöht.</p>', false, 'quittiert durch M. Muster', '08.04.13', '22:39', false, null, 'undone', 'medium', 'detail1.html');

	var item3 = new Container(3, 'Grobrechen', 'high', '<p><i>Grobrechen 1</i> - Der Grobrechen ist blockiert.</p>', false, 'quittiert durch M. Muster', '10.05.13', '10:15', true, 'rechen_anleitungen.html', 'undone', 'high', 'detail1.html');

	var item4 = new Container(4, 'Frischschlamm', 'medium', '<p><i>Frischschlammbecken</i> - Füllstand: <b>20.2 m<sup>3</sup>', false, 'quittiert durch M. Muster', '07.05.13', '6:45', false, null, 'undone', 'medium', 'detail1.html');

	var item5 = new Container(5, 'Feinrechen', 'low', '<p><i>Gebäude 2</i> - Der Feinrechen ist blockiert.</p>', false, 'quittiert durch M. Muster', '30.04.13', '12:45', true, 'rechen_anleitungen.html', 'undone', 'low', 'detail1.html');

	var item6 = new Container(6, 'Gasdepot', 'high', '<p><i>Gasdepot 1</i> - Das Depot ist zu 80% voll.</p>', false, 'quittiert durch M. Muster', '05.04.13', '12:20', false, null, 'undone', 'high', 'detail1.html');

	// Adding Items to the array

	items[0] = item1;
	items[1] = item2;
	items[2] = item3;
	items[3] = item4;
	items[4] = item5;
	items[5] = item6;

	// FORRER: Add Listener for Orientation change
	window.addEventListener('orientationchange', function() {

		item1.update();
		item2.update();
		item3.update();
		item4.update();
		item5.update();
		item6.update();

		document.getElementById('alerts').style.width = window.innerWidth + 'px';
		// Adjust margin of the menu to the top
		offset = window.innerHeight / 2 - 90 + 'px';
		document.getElementById('menu').style.top = offset;
		debug("Orientation change:" + offset, "append");
	});

	// scroll the window up to hide the address bar of the browser.
	window.setTimeout(function() {
		window.scrollTo(0, 0);
	}, 100);

	// Focus on searchfield
	document.getElementById("searchbutton").onclick = function() {
		document.getElementById("suche").focus();
	};

	// Fix for moving searchbar when virtual keyboard is shown
	document.getElementById('suche').onfocus = function() {
		document.getElementById('search').style.position = 'absolute';
		// scroll the window up to hide the address bar of the browser.
		window.setTimeout(function() {
			window.scrollTo(0, 0);
		}, 0);
	}
	document.getElementById('suche').onblur = function() {
		document.getElementById('search').style.position = 'fixed';
	}
	// Setup für Slider-Window

	// Show menu
	document.getElementById('menubutton').addEventListener(endEvent, function() {
		// ?v=1 sorgt dafür dass die Seite neu geladen wird
		addSlider('editItem.html?v=1');
	});
	
	
	/*
	 * // Adjust margin of the menu to the top offset = window.innerHeight / 2 -
	 * 90 + 'px'; document.getElementById('menu').style.top = offset;
	 */
	for ( i = 0; i < items.length; i++) {
		items[i].add(1);
	}

	// Set Div-Width of 'alerts'
	document.getElementById('alerts').style.width = window.innerWidth + 'px';

	updateAlertsHeight(items);
	reorderAlerts(items);

	debug(window.innerWidth, 'append');
	// -----------------------------------------------------------------------------

}


