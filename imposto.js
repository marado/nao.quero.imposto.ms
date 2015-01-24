/* This is the big bag of javascript. Yeah, it's ugly, patches are welcome. */

/* ****************************************************************
 * js generic functions (should get their own class and js file...)
 * ****************************************************************/

// DEBUG = true will give you debugging messages to firebug. If you don't use it, then this variable is useless to you until you change the "debug" function
DEBUG = false;

function debug(what) {
	if (DEBUG) console.log(what);
}

// Many browsers are simply silly. Let's try to workaround that...
function ajaxRequest() {
    var activexmodes=["Msxml2.XMLHTTP", "Microsoft.XMLHTTP"];   //activeX versions to check for in IE

    // Test for support for ActiveXObject in IE first (as XMLHttpRequest in IE7 is broken)
    if (window.ActiveXObject) { 
        for (var i=0; i<activexmodes.length; i++){
            try{
                return new ActiveXObject(activexmodes[i]);
            } catch(e) {
                // We should handle with the error appropriatelly
            }
        }
    } else if (window.XMLHttpRequest) { // if Mozilla, Safari etc
        return new XMLHttpRequest();
    } else {
        return false;
    }
}

// this function gets the path for the RSS, goes an AJAX call to get it, and
// then calls the processRSS function with the result
function loadRSS(path, elem, which) {
    var req = new ajaxRequest();
    req.onreadystatechange = function() {
        if (req.readyState == 4){
            if (req.status == 200){
                var xmldata = req.responseXML; //retrieve result as an XML object
                processRSS(xmldata, elem, which);
            } else {
                // TODO: deal with failures
            }
        }
    }

    try {
        req.open("GET", path, true);
        req.send(null);
    } catch (e) {
        // TODO 
    }

}

function parseXML(xml){
    var result=null;
    if (xml !== null){
        switch(xml.nodeType){
            case 3:
                if(!xml.nextSibling && !xml.previousSibling){
                    result = xml.nodeValue;
                }
                break;
            case 1:
                var a, b=0, att;
                var nodes = xml.childNodes;
                var len = nodes.length;
                result = [];
                for(a=0; a < len; a++){
                    var i = parseXML(nodes[a]);
                    if (i !== null) {
                        if(len <= 1){
                            result=i;
                        } else {
                            att = getAttribute(nodes[a],"id");
                            att = (att !== null ? att : b++);
                            result[att]=i;
                        }
                    }
                }
                break;
        }
    }
    return result;
}

function getAttribute(obj, elem) {
    if(typeof(obj)=="object"){
        return obj.getAttribute(elem);
    }
    return null;
}

// this function reads xml and turns it into a nice and sweet parsable object
function processRSS(result, elem, bypass) {
    result = parseXML(result.documentElement);
    var bypassed = 0;

	// VERY VERY UGLY HACK TO DEAL WITH THE FACT THAT IE UTTERLY *SUCKS*
	if(typeof(result[0]) != "object") result = [result];

    // UGLY way of finding out how many news there are, specially 'cause we're going to cycle through result[0] again... TODO (fix this)
    var length = 0;
    for (var i in result[0]) { if (typeof(result[0][i]) == "object") { length++; } }

    for (var i in result[0]) {
        if (typeof(result[0][i]) == "object") {
            if (bypassed >= bypass) {
                return showRSS(result[0][i], elem, bypass, length-1); // length - 1 'cause we don't work with the first object...
            } else {
                bypassed++;
            }
        }
    }
    return false;
}

// this just displays the processed RSS
function showRSS(what, where, which, total) {
    // what[0] is title
    // what[1] is content
    // what[2] is link
    // what[3] is timestmp
    
    //var html = "Title: " + what[0] + "<br/>Date: " + what[4] + "<p/>"+what[3];
    var html = "<p/><a href='"+what[2]+"'>"+what[0]+"</a><p/>"+what[1]+"<p/><div class='timestamp'>"+what[3]+"</div>";

    debug("showRSS: which is " + which + ", while total is " + total);
    var prev = which-1;
    var next = which+1;
    if (which > 1) html += "<div class='link' style='float:left;' onmousedown='news("+ prev +")'>&lt; recent</div>";
    if (which < total) html += "<div class='link' style='float:right;' onmousedown='news("+ next +")'>older &gt;</div>";
    document.getElementById(where).innerHTML=html;
}



// DOM manipulation
function setElementContent(elem, html) {
	debug("elem is " + elem);
    var e = document.getElementById(elem);
	debug(e);
    if (e && e.innerHTML !== undefined) {
        // replace null and undefined values for empty strings
        html = html === null ? "" : html;
        html = String(html);
        html = html.replace(/>null</g, '><');
        html = html.replace(/>undefined</g, '><');

        e.innerHTML = html;
		debug("just did an innerHTML, don't you see?");
        return true;
    } else {
		debug("oops");
        return false;
    }
}

/* ****************************************************************
 * site-specific functions (only these should be in this file...)
 * ****************************************************************/

// initialize website
function init() {
	container();
	sidebar();
}

// change what's displayed on container
function container(section) {
	if (section == undefined) section = "main";
	return setElementContent("container", getSection(section));	
}

function events() {
	return "<p/>Não há eventos agendados de momento.";
}

function main() {
	return "<p/>Em breve existirá aqui informação sobre o que é esta campanha.";
}

// get the HTML corresponding to a certain section
function getSection(section) {
	var html = "";

    switch (section) {
        case "events":
            html = events();
            break;
		case "main":
			html = main();
			break;
        default:
        	// TODO - add the rest of the cases. In the meantime...
        	var randomnumber=Math.floor(Math.random()*700);
        	var lorem = "<p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus</p>";
    	    html = lorem.substring(0,randomnumber);
    	    html += lorem;
            break;
    }
	return html;
}

// populate the sidebar
function sidebar() {
	var html = "";

    html += libertei();
	html += separator();
	html += drm();
	html += separator();
	html += csi();
	html += separator();
	html += ansol();

	setElementContent("sidebar", html);
}

// a simple div with 10px
function separator() {
	return "<div style='height:10px'>&nbsp;</div>";
}

function libertei() {
	return "<center>Liberte-se com Software Livre!<p/><a href='http://libertei.me'><img src='libertei.png' alt='Liberte-se também!'/></a></center>";
}

function drm() {
	return "<center>Campanha nacional contra o DRM<p/><a href='http://drm-pt.info'><img src='DRM.png' alt='DRM-PT'/></a></center>";
}

function ansol() {
	return "<center>Associação Nacional para o Software Livre<p/><a href='http://ansol.org'><img src='ansol.png' alt='ANSOL'/></a></center>";
}
function csi() {
	return "<center>Cultura e Sociedade da Informação<p/><a href='http://c.ansol.org'><img src='CSI.png' alt='CSI'/></a></center>";
}
