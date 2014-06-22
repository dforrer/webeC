// FORRER: siteUrl cannot end in "/"

var username;
var token;

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

function openLink(theLink)
{
	window.location.href = theLink.href;
}

// FORRER: not used at the moment
function smoothScrollToTop()
{
	if (document.body.scrollTop != 0 || document.documentElement.scrollTop != 0)
	{
		var topPosition = document.body.scrollTop || document.documentElement.scrollTop;
		debug("Topposition:" + topPosition, "override");
		if (topPosition > 0)
		{
			window.scrollBy(0, -13);
		}
		else
		{
			window.scrollBy(0, 13);
		}
		timeOut = setTimeout('smoothScrollToTop()', 10);
	}
	else
	{
		clearTimeout(timeOut);
	}
}

function debug(tmp, arg)
{
	return;
	if (arg == "override")
	{
		document.getElementById('info').innerHTML = tmp;
	}
	else if (arg == "append")
	{
		document.getElementById('info').innerHTML += '</br>' + tmp;
	}
}

function reorderAlerts(itemArray, speed)
{
	itemArray.sort(compareDate);
	itemArray.sort(comparePrio);
	itemArray.sort(compareIsRead);
	var offset = 0;
	for ( i = 0; i < itemArray.length; i++)
	{
		itemArray[i].setTopOffset(offset);
		itemArray[i].setVerticalPosition(offset, speed);
		offset += itemArray[i].getDivsuper().offsetHeight;
	}
}

function updateAlertsHeight(itemArray)
{
	var h = 0;
	for ( i = 0; i < itemArray.length; i++)
	{
		h += itemArray[i].getDivsuper().offsetHeight;
	}
	document.getElementById('alerts').style.height = h + 'px';

}

// Custom sort-function for Array.sort(compare);
function compareDate(a, b)
{
	if (a.getCreationDate() > b.getCreationDate())
	{
		return -1;
	}

	return 0;
}


// Custom sort-function for Array.sort(compare);
function compareIsRead(a, b)
{
	if (a.getIsRead() < b.getIsRead())
	{
		// a soll vor b erscheinen im Array
		return -1;
	}

	return 0;
}


// Custom sort-function for Array.sort(compare);
function comparePrio(a, b)
{
	if (a.getPrio() > b.getPrio())
	{
		return -1;
	}

	return 0;
}


function updateView() {
	for ( i = 0; i < items.length; i++) {
		items[i].getDivsuper().removeEventListener('webkitTransitionEnd', updateView, false);
	}
	setTimeout(function() {
		updateAlertsHeight(items);
		reorderAlerts(items, 400);
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
function Container(item_id, title, description, tags, creation_date, is_read, prio, detailLINK)
{
	// Object Variables (can't have "this.")
	var alertLevel;
	var icon;
	switch (prio)
	{
		case 3:
			alertLevel = "high";
			icon = "high";
			break;
		case 2:
			alertLevel = "medium";
			icon = "medium";
			break;
		case 1:
			alertLevel = "low";
			icon = "low";
			break;

	}
	var state = "done";
	if (is_read == 0)
	{
		state = "undone";
	}
	var divsuper;
	var content;
	var left;
	var right;
	var topOffset;
	var touchstarted = false;
	var startX = 0;
	var startY = 0;
	var distanceX = 0;
	var distanceY = 0;
	var timerCounter = 0;
	var timer = 0;

	this.getDiv = function()
	{
		return content;
	}

	this.getIsRead = function ()
	{
		return is_read;
	}

	this.getPrio = function ()
	{
		return prio;
	}

	this.getCreationDate = function ()
	{
		return creation_date;
	}

	this.getAlertlevel = function() {
		return alertLevel;
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

	this.add = function(opacity)
	{
		// divsuper contains three divs: left, content, right
		divsuper = document.createElement('div');
		divsuper.setAttribute('class', 'divsuper');
		divsuper.setAttribute('id', item_id);

		left = document.createElement('div');
		left.setAttribute('class', 'leftdrag');
		left.innerHTML = "<img id='arrowleft" + item_id + "' src='pictures/pfeil_left.png?v=1' style='width:42px'/><p style='margin:10px; color: #434343; font-size:14px;'><b>Erledigt?</b></p>";

		right = document.createElement('div');
		right.setAttribute('class', 'rightdrag');
		right.innerHTML = "<img id='arrowright" + item_id + "' src='pictures/pfeil_right.png?v=1' style='width:42px'/><p style='margin:10px; color: #434343; font-size:14px;'><b>Löschen?</b></p>";

		content = document.createElement('div');

		// Set id, class of content
		if (is_read == 1)
		{
			state = 'done';
			content.setAttribute('class', 'done');
		}
		else
		{
			state = 'undone';
			content.setAttribute('class', alertLevel);
		}
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
		if (state == 'done')
		{
			table += "<img class='alerticon' style='opacity:0.5;' src='pictures/" + icon + "_dark.png' />";
		}
		else
		{
			table += "<img class='alerticon' src='pictures/" + icon + "_white.png' />";
		}
		table += "</td>";
		table += "<td style='width:98%'>";
		if (state == 'undone')
		{
			table += "<h1>" + title + "</h1>";
		}
		else
		{
			table += "<h2>" + title + "</h2>";
		}
		table += "</td>";
		table += "<td style='width:1%'><p class='dates'>";
		table += creation_date.getDate() + '.' + (creation_date.getMonth() + 1) + '.' + (creation_date.getFullYear()-2000);
		table += "</p></td>";
		table += "</tr>";
		table += "<tr><td style='height:10px'></td></tr>";
		table += "<tr>";
		table += "<td></td>";
		table += "<td style='vertical-align: top' id='text" + item_id + "'>";


		if (tags != null && state == 'undone' && tags != '')
		{
			table += "<div class='highlight" + alertLevel + "'>";
			var highlightedtext_with_commas = tags.replace(/ /g, ", ");
			table += highlightedtext_with_commas;
			table += "</div>";
		}
		else if (tags != null && state == 'done' && tags != '')
		{
			table += "<div class='highlightdone'>";
			var highlightedtext_with_commas = tags.replace(/ /g, ", ");
			table += highlightedtext_with_commas;
			table += "</div>";
		}
		table += "<p>";
		table += description;
		table += "</p>";
		table += "</td>";
		table += "<td style='vertical-align: top'>";
		table += "<p class='dates'><b>";
		table += (creation_date.getHours() + (creation_date.getTimezoneOffset()/60)*(-1)) + ':' + creation_date.getMinutes();
		table += "</b></p>";
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
		// DO NOTHING
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
				var arrow = document.getElementById('arrowleft' + item_id);
				arrow.style.webkitTransitionDuration = "300ms";
				arrow.style.webkitTransform = "rotateZ(-180deg)";
			}
			if (distanceX < 160 && distanceX > 0) {
				var arrow = document.getElementById('arrowleft' + item_id);
				arrow.style.webkitTransitionDuration = "300ms";
				arrow.style.webkitTransform = "rotateZ(0deg)";
			}
			if (distanceX > -160) {
				var arrow = document.getElementById('arrowright' + item_id);
				arrow.style.webkitTransitionDuration = "300ms";
				arrow.style.webkitTransform = "rotateZ(0deg)";
			}

			if (distanceX < -160) {
				var arrow = document.getElementById('arrowright' + item_id);
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

	// FORRER: moveLeft(), moveRight(), comeBack() need to be defined before we use them

	this.endHandler = function(event)
	{
		clearInterval(timer);

		// debug("distanceX px:"+ distanceX + " per ms: " +
		// (timerCounter),"override");
		var absX = Math.abs(distanceX);
		var absY = Math.abs(distanceY);

		if (absX > absY)
		{
			// the following conditions have been discussed in details
			if (distanceX > 160)
			{
				if (is_read == 0)
				{
					state = 'done';
					is_read = 1;
					content.setAttribute('class', 'done');
				}
				else
				{
					state = 'undone';
					is_read = 0;
					content.setAttribute('class', alertLevel);
				}
				updateItem(item_id, title, prio, tags, description, creation_date, is_read);
			}
			else if (distanceX < -160)
			{
				// TODO: Delete item
				deleteItem(item_id);

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
	// Prepare JSON-Object
	//---------------------
	var obj = new Object();

	obj.username = document.getElementById('username').value;
	obj.secret	 = document.getElementById('secret').value;

	var jsonString= JSON.stringify(obj);

	// AJAX-Request to gettoken.php
	//------------------------------
	var xhr = new XMLHttpRequest();
	xhr.open('POST', 'api/gettoken.php', true);
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.onreadystatechange = function()
	{
		if (this.readyState !== 4)
		{
			return;
		}
		if (this.status !== 200)
		{
			return;
		}
		// Do something here
		var data = new Object();
		data.resp = JSON.parse(this.responseText);
		if(data.resp.token == null)
		{
			alert('Login failed!');
			
			//TODO: Add non-draggable slider
			var timestamp = new Date();
			addSlider('login.html?timestamp=' + timestamp.getTime());
		}
		else
		{
			//alert('Token:'+data.resp.token);
			username = obj.username;
			token = data.resp.token;
			setCookie("username", obj.username,100);
			setCookie("token", data.resp.token,100);
			getitems();
		}
	};
	xhr.send(jsonString);
}



function addNewItem()
{
	var prio_new 		= document.getElementById("prio_new").value;
	var title_new 		= document.getElementById("title_new").value;
	var description_new = document.getElementById("description_new").value;
	var tags_new		= document.getElementById("tags_new").value;

	// Prepare JSON-Object
	//---------------------
	var obj = new Object();

	obj.username = username;
	obj.token	 = token;
	obj.title 	 = title_new;
	obj.prio 	 = prio_new;
	obj.tags	 = tags_new;
	obj.description   = description_new;
	obj.creation_date = new Date().toISOString().slice(0, 19).replace('T', ' ');

	var jsonString= JSON.stringify(obj);

	//alert(jsonString);

	// AJAX-Request to gettoken.php
	//------------------------------
	var xhr = new XMLHttpRequest();
	xhr.open('POST', 'api/additem.php', true);
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.onreadystatechange = function()
	{
		if (this.readyState !== 4)
		{
			return;
		}
		if (this.status !== 200)
		{
			return;
		}
		// Ignore response of "item_id"

		getitems();
	};
	xhr.send(jsonString);
}

function updateItem(item_id, title, prio, tags, description, creation_date, is_read)
{
	// Prepare JSON-Object
	//---------------------
	var obj = new Object();

	obj.username = username;
	obj.token	 = token;
	obj.item_id  = item_id;
	obj.title	 = title;
	obj.prio	 = prio;
	obj.tags	 = tags;
	obj.description = description;
	obj.creation_date = creation_date.getFullYear() + "-"
		+ (creation_date.getMonth() + 1) + '-'
		+ creation_date.getDate() + " "
		+ creation_date.getHours() + ':'
		+ creation_date.getMinutes() + ":"
		+ creation_date.getSeconds();
	console.log(obj.creation_date);
	obj.is_read = is_read;

	var jsonString= JSON.stringify(obj);

	//alert(jsonString);

	// AJAX-Request to gettoken.php
	//------------------------------
	var xhr = new XMLHttpRequest();
	xhr.open('POST', 'api/updateitem.php', true);
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.onreadystatechange = function()
	{
		if (this.readyState !== 4)
		{
			return;
		}
		if (this.status !== 200)
		{
			return;
		}
		// Ignore response of "item_id"
		//alert(this.responseText);
	};
	xhr.send(jsonString);
}


function deleteItem(item_id)
{
	// Prepare JSON-Object
	//---------------------
	var obj = new Object();

	obj.username = username;
	obj.token	 = token;
	obj.item_id  = item_id;

	var jsonString= JSON.stringify(obj);

	// AJAX-Request to gettoken.php
	//------------------------------
	var xhr = new XMLHttpRequest();
	xhr.open('POST', 'api/deleteitem.php', true);
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.onreadystatechange = function()
	{
		if (this.readyState !== 4)
		{
			return;
		}
		if (this.status !== 200)
		{
			return;
		}
		// Ignore response of "item_id"

		// load all items again
		//----------------------
		getitems();

	};
	xhr.send(jsonString);
}


function getitems()
{
	// Prepare JSON-Object
	//---------------------
	var obj = new Object();

	obj.username = username;
	obj.token	 = token;

	var jsonString= JSON.stringify(obj);

	// AJAX-Request to gettoken.php
	//------------------------------
	var xhr = new XMLHttpRequest();
	xhr.open('POST', 'api/getitems.php', true);
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.onreadystatechange = function()
	{
		if (this.readyState !== 4)
		{
			return;
		}
		if (this.status !== 200)
		{
			return;
		}

		// Do something with the response
		//--------------------------------
		var data = new Object();
		console.log(this.responseText);
		data.resp = JSON.parse(this.responseText);
		if(data.resp.items == null)
		{
			alert('Loading items failed!');
			//TODO: Add non-draggable slider
			var timestamp = new Date();
			addSlider('login.html?timestamp=' + timestamp.getTime());
		}
		else
		{
			// Clear items-Array from previous items
			//---------------------------------------
			var alerts = document.getElementById('alerts');
			while (alerts.firstChild)
			{
				alerts.removeChild(alerts.firstChild);
			}
			items.clear;

			// Iterate through response
			//--------------------------
			for (var i = 0; i < data.resp.items.length ; i++)
			{
				var itemJSON = data.resp.items[i];
				var itemDate = new Date(itemJSON.creation_date.replace(/-/g,"/"));

				// function Container(item_id, title, description, tags, creation_date, is_read, prio, detailLINK)
				var item = new Container(
					itemJSON.item_id,
					itemJSON.title,
					itemJSON.description,
					itemJSON.tags,
					itemDate,
					itemJSON.is_read,
					itemJSON.prio,
					'');
				items.push(item);
				item.add(1);
				console.log(itemJSON.item_id);
			}
			updateAlertsHeight(items);
			reorderAlerts(items, 0);
		}
	};
	xhr.send(jsonString);
}


function checkCookie() 
{
	token = getCookie("token");
	username = getCookie("username");

    if ( token != "") 
    {
		// TODO: Load new items
		alert("Logged in as: " + username);
		getitems();
    }
    else
    {
		//TODO: Add non-draggable slider
		var timestamp = new Date();
		addSlider('login.html?timestamp=' + timestamp.getTime());
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

function handleCommand (cmd)
{
	var cmdArray = cmd.split(" ");
	switch(cmdArray[0])
	{
		case "Login":
			alert("Login command: " + cmdArray.length);
			break;
		case "Logout":
			alert("Logout");
			break;
		default:
			alert("Unknown command");
	}	
}

function init() 
{
	isTouchSupported = 'ontouchstart' in window;
	startEvent = isTouchSupported ? 'touchstart' : 'mousedown';
	moveEvent = isTouchSupported ? 'touchmove' : 'mousemove';
	endEvent = isTouchSupported ? 'touchend' : 'mouseup';

	// FORRER: Set slide-dimensions
	browserWidth = window.innerWidth;

	// Check Login
	//-------------
	checkCookie();

/*
	// Elemente initialisieren
	var item1 = new Container(1, 'Einkaufen Heute', 'high', '<p><i>Biologie</i> - Fällmittelpumpe 3 ist ausgefallen. Hier steht mal etwas richtig langes! Ein halber Roman steht hier.</p>', 'Einkaufen Geschenke', '12.05.13', '19:56', false, null, 'undone', 'high', 'detail1.html');

	var item2 = new Container(2, 'webeC lernen', 'medium', '<p>Ich muss noch webeC lernen.</p>', 'Todo FHNW', '08.04.13', '22:39', false, null, 'undone', 'medium', 'detail1.html');

	var item3 = new Container(3, 'Grobrechen', 'high', '<p><i>Grobrechen 1</i> - Der Grobrechen ist blockiert.</p>', null, '10.05.13', '10:15', true, 'rechen_anleitungen.html', 'undone', 'high', 'detail1.html');

	var item4 = new Container(4, 'Frischschlamm', 'medium', '<p><i>Frischschlammbecken</i> - Füllstand: <b>20.2 m<sup>3</sup>', 'quittiert durch M. Muster', '07.05.13', '6:45', false, null, 'undone', 'medium', 'detail1.html');

	var item5 = new Container(5, 'Feinrechen', 'low', '<p><i>Gebäude 2</i> - Der Feinrechen ist blockiert.</p>', 'quittiert durch M. Muster', '30.04.13', '12:45', true, 'rechen_anleitungen.html', 'undone', 'low', 'detail1.html');

	var item6 = new Container(6, 'Gasdepot', 'high', '<p><i>Gasdepot 1</i> - Das Depot ist zu 80% voll.</p>', 'quittiert durch M. Muster', '05.04.13', '12:20', false, null, 'undone', 'high', 'detail1.html');

	// Adding Items to the array

	items[0] = item1;
	items[1] = item2;
	items[2] = item3;
	items[3] = item4;
	items[4] = item5;
	items[5] = item6;
*/

	// FORRER: Add Listener for Orientation change
	window.addEventListener('orientationchange', function() {

		for ( i = 0; i < items.length; i++) 
		{
			items[i].update();
		}

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
		document.getElementById("topinput").focus();
	};

	// Fix for moving searchbar when virtual keyboard is shown
	document.getElementById('topinput').onfocus = function() {
		document.getElementById('search').style.position = 'absolute';
		// scroll the window up to hide the address bar of the browser.
		window.setTimeout(function() {
			window.scrollTo(0, 0);
		}, 0);
	}
	document.getElementById('topinput').onblur = function() {
		document.getElementById('search').style.position = 'fixed';
	}
	
	// Setup für Slider-Window

	// Show menu
	document.getElementById('addbutton').addEventListener(endEvent, function() {
		// ?v=1 sorgt dafür dass die Seite neu geladen wird
		var timestamp = new Date();  
		var link = 'additem.html?timestamp=' + timestamp.getTime();
		addSlider(link);
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
	reorderAlerts(items, 0);

	debug(window.innerWidth, 'append');
	// -----------------------------------------------------------------------------

}


