// Framework Variablen
var deviceReadyDeferred = jQuery.Deferred();
var jqmReadyDeferred = jQuery.Deferred();
// Zeit in Millisekunden wird an jeden Request angehangen um ihn unique zu machen (Safari Bug)
var date = new Date();
var timestamp = date.getTime();
// Weitere Variablen
var uuid = "2";
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
	$("label").inFieldLabels();
			
				
	$.ajax({
		type: "GET",
    	dataType: "jsonp",
		url: "http://kiste.eventfive.de/asd/func.php?option=getData",
		data: { id: uuid, unique: timestamp },
		cache: false,
		complete: function(data) {
					console.log(data);
					if ( username != null && username != "") {
						$('span.username').html(username);
						$.mobile.navigate( "#welcome" );
					}
					else $('.user').fadeIn();
				  }
	});
	
});


// PHONEGAP & JQUERY //////////////////////////////////////////////
// Hier legen wir fest, dass sobald jQuery und PhoneGap bereit sind, die Funktion "doWhenBothFrameworksLoaded" aufgerufen wird
jQuery.when(deviceReadyDeferred, jqmReadyDeferred).then(doWhenBothFrameworksLoaded);
// Ab hier können alle Funktionen laufen!
function doWhenBothFrameworksLoaded() {
	
	// GeräteID auslesen
	uuid = getName(device.uuid);


	// START screen
	if ( startAnimation == true ) {
		$('.user').hide()
		startAnimation = false;		
	}
	
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
			dataType: "jsonp",
			url: "http://kiste.eventfive.de/voivoi/func.php?option=sendName" ,
			data: { id: uuid, username: username, unique: timestamp },
			beforeSend: function() { $.mobile.loading('show') },
			//error: AjaxFailed,
			complete: goToWelcome,
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