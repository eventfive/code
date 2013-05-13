// Framework Variablen
var deviceReadyDeferred = jQuery.Deferred();
var jqmReadyDeferred = jQuery.Deferred();
// Zeit in Millisekunden wird an jeden Request angehangen um ihn unique zu machen (Safari Bug)
var date = new Date();
var timestamp = date.getTime();
// Weitere Variablen
var uuid = timestamp;
var startAnimation = true;


// PHONEGAP ///////////////////////////////////////////////////////
document.addEventListener("deviceReady", deviceReady, false);
function deviceReady() {		
	deviceReadyDeferred.resolve();  // Wie oben benannt wird jQuery nun mitgeteilt, dass deviceReady() fertig ist
}


// JQUERY /////////////////////////////////////////////////////////
jQuery(document).ready(function () {
	jqmReadyDeferred.resolve();   // Hier wird jQuery mitgeteilt, dass es selbst fertig ist
		
	
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
		$('.user').hide().delay(2000).fadeIn();
		startAnimation = false;
	}
	$("#sendName").click(function() {
		var username = $.trim($("#username").val());
		if ( username.length > 0 ) {
			$.ajax({
				type: "POST",
				dataType: "jsonp",
				url: "http://kiste.eventfive.de/voivoi/func.php?option=sendName&unique=" + timestamp,
				data: { id: uuid, username: username },
				beforeSend: function() { $.mobile.loading('show') },
				//error: AjaxFailed,
				complete: goToWelcome,
			});
		}
		else { $('.error.username').hide().html("Bitte nenn uns doch deinen Namen!").fadeIn(); }
	});
	
	// MENU functions
	$('a[href="#welcome"]').on("click", function(event){
		// Seitenwechsel abbrechen
		event.preventDefault();
		goToWelcome;
	});
	
	// Weitere Funktionen
	// Accordion animation
	$('.listanimation').bind('expand', function () {
		$(this).children().slideDown(500);
		}).bind('collapse', function () {
			$(this).children().next().slideUp(500);
	});
}

function goToWelcome() {
		$.mobile.loading('show');
		// Funktionen ausführen
		
		// Seitenwechsel manuell starten
		$.mobile.navigate( "#welcome" );
	}