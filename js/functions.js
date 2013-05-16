// Framework Variablen
var deviceReadyDeferred = jQuery.Deferred();
var jqmReadyDeferred = jQuery.Deferred();
// Zeit in Millisekunden wird an jeden Request angehangen um ihn unique zu machen (Safari Bug)
var date = new Date();
var timestamp = date.getTime();
// Weitere Variablen
var appURL = "http://kiste.eventfive.de/asd/"
var uuid = "5", platform = "Desktop", osVersion = "1";
var startAnimation = true;
var username;
var array = new Array();
var data = "";


// PHONEGAP ///////////////////////////////////////////////////////
document.addEventListener("deviceReady", deviceReady, false);
function deviceReady() {		
	deviceReadyDeferred.resolve();  // Wie oben benannt wird jQuery nun mitgeteilt, dass deviceReady() fertig ist
}


// JQUERY /////////////////////////////////////////////////////////
jQuery(document).ready(function () {
	jqmReadyDeferred.resolve();   // Hier wird jQuery mitgeteilt, dass es selbst fertig ist
	
	// Accordion animation
	$('.listanimation').bind('expand', function () {
		$(this).children().slideDown(500);
		}).bind('collapse', function () {
			$(this).children().next().slideUp(500);
	});
	
	// Kommentar Counter
	$('#comment').NobleCount('#counter',{
			max_chars: 140,
		});
	
	
	
});


// PHONEGAP & JQUERY //////////////////////////////////////////////
// Hier legen wir fest, dass sobald jQuery und PhoneGap bereit sind, die Funktion "doWhenBothFrameworksLoaded" aufgerufen wird
jQuery.when(deviceReadyDeferred, jqmReadyDeferred).then(doWhenBothFrameworksLoaded);
// Ab hier können alle Funktionen laufen!
function doWhenBothFrameworksLoaded() {
	
	// GeräteID auslesen
	uuid = device.uuid;
	platform = device.platform;
	osVersion = device.version;


	// START screen
	if ( startAnimation == true ) {
		$('.user').hide()
		startAnimation = false;		
	}		
				
	$.ajax({
		type: "GET",
		contentType: "application/json",
    	dataType: "JSONP",
		crossDomain: true,
		jsonp: 'jsoncallback',
		url: appURL + "func.php?option=getData",
		data: { id: uuid, unique: timestamp },
		cache: false,
		success: function(data){
			$.each(data, function(i,item){ 
				username = item.username;
			});
			if ( username != null && username != "") {
				$('span.username').html(username);
				$.mobile.navigate( "#welcome" );
			}
			else $('.user').fadeIn();
		},
	});
	
	// MENU functions
	$('a[href="#welcome"]').on("click", function(event){
		// Seitenwechsel abbrechen
		event.preventDefault();
		goToWelcome;
	});
	
}

function sendName() {
	username = $.trim($("input#username").val());
	if ( username.length > 0 ) {
		$.ajax({
			type: "POST",
			contentType: "application/json",
    		dataType: "JSONP",
			jsonp: 'jsoncallback',
			url: appURL + "func.php?option=sendName" ,
			data: { id: uuid, platform: platform, osVersion: osVersion, username: username, unique: timestamp },
			beforeSend: function() { $.mobile.loading('show') },
			success: goToWelcome,
		});
	}
	else { $('.error.username').hide().html("Bitte nenn uns doch deinen Namen!").fadeIn(); }
};

function goToWelcome() {
	$.mobile.loading('show');
	// Funktionen ausführen
	
	// Seitenwechsel manuell starten
	$.mobile.navigate( "#welcome" );
}