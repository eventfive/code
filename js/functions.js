// Globale Variablen festlegen
var deviceReadyDeferred = jQuery.Deferred();
var jqmReadyDeferred = jQuery.Deferred();
var loading = false;


// PHONEGAP ///////////////////////////////////////////////////////
document.addEventListener("deviceReady", deviceReady, false);
function deviceReady() {		
	deviceReadyDeferred.resolve();  // Wie oben benannt wird jQuery nun mitgeteilt, dass deviceReady() fertig ist
}


// JQUERY /////////////////////////////////////////////////////////
jQuery(document).ready(function () {
	jqmReadyDeferred.resolve();   // Hier wird jQuery mitgeteilt, dass es selbst fertig ist
	$('a[href="#welcome"]').on("click", function(event){
		// Seitenwechsel abbrechen
		event.preventDefault();
		$.mobile.loading('show', { html: '<div class="loading-spinner"></div>' });
		// Funktionen ausführen
		alert("asdasd");
		// Seitenwechsel manuell starten
		$.mobile.navigate( "#welcome" );
	});
});


// PHONEGAP & JQUERY //////////////////////////////////////////////
// Hier legen wir fest, dass sobald jQuery und PhoneGap bereit sind, die Funktion "doWhenBothFrameworksLoaded" aufgerufen wird
jQuery.when(deviceReadyDeferred, jqmReadyDeferred).then(doWhenBothFrameworksLoaded);
// Ab hier können alle Funktionen laufen!
function doWhenBothFrameworksLoaded() {

	// Accordion animation
	$('.listanimation').bind('expand', function () {
		$(this).children().slideDown(500);
		}).bind('collapse', function () {
			$(this).children().next().slideUp(500);
	});
	
	// START screen
	if ( $('.ui-page').attr("id") == "start" &&  $('#start.ui-page').css("display") != "none" ) {
		$('.user').hide().delay(2000).fadeIn();
	}
	
	// MENU functions
	$('a[href="#welcome"]').on("click", function(event){
		// Seitenwechsel abbrechen
		event.preventDefault();
		$.mobile.loading('show', { html: "<div class='loader'></div>" });
		// Funktionen ausführen
		
		// Seitenwechsel manuell starten
		$.mobile.navigate( "#welcome" );
	});
	
}