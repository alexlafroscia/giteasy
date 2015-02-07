/*
 * Script for the Get Started form animations
 */

//fade the get started button out, fade the form in
function showForm()
{
	var fadeInOpacity = 0, fadeOutOpacity = 1,
	offsetCount = 150;

	window.setInterval(function()
	{
		if(fadeInOpacity <= 1 && fadeOutOpacity >=0)
		{
			fadeInOpacity += 0.1;
			fadeOutOpacity -= 0.1;
			offsetCount -= 15;
			document.getElementById('loginInfoPanel').style.opacity = "" + fadeInOpacity;
			document.getElementById('loginInfoPanel').style.right = "-" + offsetCount;

			document.getElementById('submitGit-button').style.opacity = "" + fadeInOpacity;
			document.getElementById('submitGit-button').style.left = "-" + offsetCount;

			document.getElementById('login-open-button').style.opacity = "" + fadeOutOpacity;
		}
		else
		{
			document.getElementById('login-open-button').style.visibility = "hidden";
			window.clearInterval();
		}
	}, 30);
}
