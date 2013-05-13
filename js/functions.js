// Framework Variablen
var deviceReadyDeferred = jQuery.Deferred();
var jqmReadyDeferred = jQuery.Deferred();
// Zeit in Millisekunden wird an jeden Request angehangen um ihn unique zu machen (Safari Bug)
var date = new Date();
var timestamp = date.getTime();
// data Variablen
var uuid = timestamp;


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

	// Accordion animation
	$('.listanimation').bind('expand', function () {
		$(this).children().slideDown(500);
		}).bind('collapse', function () {
			$(this).children().next().slideUp(500);
	});
	
	// START screen
	if ( $('#start.ui-page').css("display") != "none" ) {
		$('.user').hide().delay(2000).fadeIn();
		alert("ready");
		$("#sendName").click(function() {
			$.ajax({
				type: "POST",
				url: "http://kiste.eventfive.de/voivoi/func.php?option=sendName&unique=" + timestamp,
				data: "&id=" + uuid + "&username=" + $('#username').val(),
				beforeSend: function() { $.mobile.loading('show') },
				//error: AjaxFailed,
				complete: function() { $.mobile.navigate( "#welcome" ) },
			});
			function AjaxFailed(result) {
				alert(result.status + ' ' + result.statusText);
			}
		});
	}
	
	// MENU functions
	$('a[href="#welcome"]').on("click", function(event){
		// Seitenwechsel abbrechen
		event.preventDefault();
		$.mobile.loading('show');
		// Funktionen ausführen
		
		// Seitenwechsel manuell starten
		$.mobile.navigate( "#welcome" );
	});
}