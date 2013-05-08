// Globale Variablen festlegen
var deviceReadyDeferred = jQuery.Deferred();
var jqmReadyDeferred = jQuery.Deferred();


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

	// Accordion animation
	$('.listanimation').bind('expand', function () {
		$(this).children().slideDown(500);
		}).bind('collapse', function () {
			$(this).children().next().slideUp(500);
	});
	
	// START screen
	if ( $('.ui-page').attr("id") == "start" &&  $('#start.ui-page').css("display") != "none" ) {
		$('.user').hide();
		window.setTimeout(enableusername, 2000);
	}
	function enableusername() { $('.user').fadeIn(); }
	
	// MENU functions
	$('a[href="#welcome"]').on("click", function(e){
		alert("willkommen");
	});
	$('a[href="#calender"]').on("click", function(e){
		alert("kalender");
	});
	
}