// ==UserScript==
// @name Minimal Tetris Friends
// @namespace minimaltetrisfriends
// @description Reduces lag as much as possible
// @include http://*tetrisfriends.com/games/Ultra/game.php*
// @include http://*tetrisfriends.com/games/Sprint/game.php*
// @include http://*tetrisfriends.com/games/Live/game.php*
// @grant none
// @run-at document-start
// @version 4.2.5 Firefox-only
// @author morningpee
// ==/UserScript==

window.stop();

/*start fresh with html5 document */
document.doctype&&
    document.replaceChild( document.implementation.createDocumentType('html', "", ""), document.doctype );

document.replaceChild(
        document.implementation.createHTMLDocument("Minimal Tetris Friends").documentElement,
        document.documentElement
);

function buildFlashVarsParamString()
{
    var flashVars = new Object();

    var flashVarsRequest = new XMLHttpRequest();
    flashVarsRequest.addEventListener("load", function(){ try{ haveFlashVars(this.responseText, flashVars); } catch(err){alert(err);} } );

    var ASYNCHRONOUS_REQUEST = true;
    flashVarsRequest.open('GET', location.pathname, ASYNCHRONOUS_REQUEST);
    flashVarsRequest.send();
}

function getContentFlashSize()
{
    contentFlashSize = new Object();

    contentFlashSize.T_PAN_X_INDEX = 0;
    contentFlashSize.T_PAN_Y_INDEX = 1;

    contentFlashSize.T_WIDTH_SCALE_INDEX = 2;
    contentFlashSize.T_HEIGHT_SCALE_INDEX = 3;

    contentFlashSize.T_WIDTH_INDEX = 8;
    contentFlashSize.T_HEIGHT_INDEX = 9;

    contentFlashSize.originalWidth = gameSize[gameName][0];
    contentFlashSize.originalHeight = gameSize[gameName][1];

    contentFlash.style.width = contentFlashSize.originalWidth + "px";
    contentFlash.style.height = contentFlashSize.originalHeight + "px";
}

function scaleContentFlash()
{
    contentFlashSize.scaleFactor = 1;

    contentFlashSize.minimalWidth = contentFlashSize.originalWidth / contentFlashSize.scaleFactor;
    contentFlashSize.minimalHeight = contentFlashSize.originalHeight / contentFlashSize.scaleFactor;

    contentFlash.style.width = contentFlashSize.minimalWidth + "px";
    contentFlash.style.height = contentFlashSize.minimalHeight + "px";

    contentFlash.TSetProperty("/", contentFlashSize.T_HEIGHT_SCALE_INDEX, 100 / contentFlashSize.scaleFactor);
    contentFlash.TSetProperty("/", contentFlashSize.T_WIDTH_SCALE_INDEX, 100 / contentFlashSize.scaleFactor);
}

function transformContentFlash()
{
    contentFlash.style.visibility = "initial";
    var windowAspectRatio = innerHeight / innerWidth;

    var contentFlashAspectRatio = contentFlashSize.originalHeight / contentFlashSize.originalWidth;

    var scaleFactorX;
    var scaleFactorY;

    if(  contentFlashAspectRatio > windowAspectRatio )
    {
        updatedWidth = Math.round( innerHeight / contentFlashAspectRatio );
        updatedHeight = innerHeight;
    }
    else
    {
        updatedWidth = innerWidth;
        updatedHeight = Math.round( innerWidth * contentFlashAspectRatio );
    }

    scaleFactorX = updatedWidth / contentFlashSize.minimalWidth;
    scaleFactorY = updatedHeight / contentFlashSize.minimalHeight;
    contentFlash.TSetProperty("/", contentFlashSize.T_HEIGHT_SCALE_INDEX, 100 * scaleFactorX);
    contentFlash.TSetProperty("/", contentFlashSize.T_WIDTH_SCALE_INDEX, 100 * scaleFactorY);

    contentFlash.style.marginTop = -updatedHeight / 2 + "px";
    contentFlash.style.marginLeft = -updatedWidth / 2 + "px";

    contentFlash.style.width = updatedWidth + "px";
    contentFlash.style.height = updatedHeight + "px";
    contentFlash.TSetProperty("/", contentFlashSize.T_PAN_X_INDEX, (contentFlashSize.minimalWidth - updatedWidth) / 2);
    contentFlash.TSetProperty("/", contentFlashSize.T_PAN_Y_INDEX, (contentFlashSize.minimalHeight - updatedHeight) / 2);
}

function buildContentFlash(flashVarsParamString)
{
    var contentFlash = document.createElement("embed");
    contentFlash.setAttribute("id", "contentFlash");
    contentFlash.setAttribute("allowscriptaccess", "always");
    contentFlash.setAttribute("name", "plugin");
    contentFlash.setAttribute("type", "application/x-shockwave-flash");
    contentFlash.setAttribute("wmode", "gpu");
    contentFlash.setAttribute("flashvars", flashVarsParamString);
    contentFlash.setAttribute("quality", "low");
    contentFlash.setAttribute("salign", "tl"); /* Live in particular needs this */
    contentFlash.setAttribute("scale", "noscale");

    contentFlash.style.visibility = "hidden";

    return contentFlash;
}

function runOnContentFlashLoaded()
{
    var percentLoaded = "0";
    try{
        percentLoaded = contentFlash.PercentLoaded();

        /* this line will fail if it is not loaded */
        contentFlash.TGetProperty('/', 0);
    }
    catch(e){
        percentLoaded = "0";
    }

    if( percentLoaded != "100" )
       return setTimeout( runOnContentFlashLoaded, 300 );
    getContentFlashSize();

    var isFirefox = navigator.userAgent.search(/webkit/i) == -1;
    if( isFirefox )
    {
        scaleContentFlash();
        transformContentFlash();
    }
}

function mtfInit()
{
    contentFlash.LoadMovie(0, "http://www.tetrisfriends.com/data/games/" + gameName + "/" + gameFileName[ gameName ]);
    runOnContentFlashLoaded();
    addEventListener("resize", transformContentFlash );
    keepAlive();
}

gameFileName = [];
gameFileName['Ultra'] = 'OWGameUltra.swf';
gameFileName['Sprint'] = 'OWGameSprint.swf';
gameFileName['Live'] = 'OWGameTetrisLive.swf';
gameName = location.href.match(/games\/(.*)\/game.php/)[1];

gameSize = [];
gameSize['Ultra'] = [760, 560];
gameSize['Sprint'] = [760, 560];
gameSize['Live'] = [946, 560];

document.body.appendChild( document.createElement('style') ).innerHTML = '* { margin: 0; } :root{ image-rendering: optimizespeed; } @viewport { zoom: 1; min-zoom: 1; max-zoom: 1; user-zoom: fixed; } * { margin: 0; padding: 0; outline: none; box-sizing: border-box; } body { background: url(http://tetrisow-a.akamaihd.net/data5_0_0_1/images/bg.jpg) repeat-x; margin: 0; display: block; overflow: hidden; } embed { position: absolute; top: 50%; left: 50%; }';

buildFlashVarsParamString();

function haveFlashVars(responseText, flashVars)
{
    var $ = {};
    $.cookie = function (variable){
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return '';
    };

    var theExternalId = null;
    var theLoginId = null;
    var prerollEnabled = false;
    var analyticsEnabled = false;
    var theStartParam = "clickToPlay";

    flashVars = Object.assign( flashVars, eval( responseText.match(/flashVars = {[\s\S]*(friendUserIds|guestId).*}/)[0] ) );
    delete flashVars.theGamePath;
    delete flashVars.isDemo;
    delete flashVars.ip;
    delete flashVars.externalId;
    delete flashVars.loginId;
    delete flashVars.channelId;
    delete flashVars.numGamesToPlayAd;
    delete flashVars.isPrerollEnabled;
    delete flashVars.isAnalyticsEnabled;
    delete flashVars.isPrerollEnabled;
    delete flashVars.prerollId;

    flashVarsParamString = Object.keys( flashVars ).map(k => k + '=' + flashVars[k] ).join('&');

    document.body.appendChild( buildContentFlash( flashVarsParamString ) );
    mtfInit();
}

function keepAlive()
{
    var keepAliveRequest = new XMLHttpRequest();
    var ASYNCHRONOUS_REQUEST = true;
    keepAliveRequest.open('GET', "/users/ajax/refresh_session.php", ASYNCHRONOUS_REQUEST);
    keepAliveRequest.send();
    setTimeout(keepAlive, 30 * 1000);
}