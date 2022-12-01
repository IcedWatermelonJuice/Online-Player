(function($) {
	$.fn.vControl = function(v0, v1, cb) {
		var t = this,
			r = undefined;
		if (!t.is("video") || t.length === 0) {
			console.error("$.vControl(v0, v1)：必须为video标签元素");
			return false
		}
		t = t[0];
		switch (v0) {
			case "p+":
				t.play();
				setTimeout(() => {
					t.play();
				}, 100);
				r = true;
				break;
			case "p-":
				t.pause();
				setTimeout(() => {
					t.pause();
				}, 100)
				r = false;
				break;
			case "p":
				r = !t.paused;
				break;
			case "v+":
				v1 = v1 ? parseFloat(v1) : 0.1;
				t.volume = (t.volume + v1).toFixed(2) <= 1 ? (t.volume + v1).toFixed(2) : 1;
				r = t.volume;
				break;
			case "v-":
				v1 = v1 ? parseFloat(v1) : 0.1;
				t.volume = (t.volume - v1).toFixed(2) >= 0 ? (t.volume - v1).toFixed(2) : 0;
				r = t.volume;
				break;
			case "v":
				if (parseFloat(v1)) {
					t.volume = v1;
				}
				r = t.volume;
				break;
			case "t+":
				v1 = parseFloat(v1) ? parseFloat(v1) : 0.1;
				t.currentTime = (t.currentTime + v1) <= t.duration ? (t.currentTime + v1) : t.duration;
				r = t.currentTime;
				break;
			case "t-":
				v1 = parseFloat(v1) ? parseFloat(v1) : 0.1;
				t.currentTime = (t.currentTime - v1) >= 0 ? (t.currentTime - v1) : 0;
				r = t.currentTime;
				break;
			case "t":
				if (parseFloat(v1)) {
					t.currentTime = v1;
				}
				r = t.currentTime;
				break;
			case "f+":
				t.webkitEnterFullScreen();
				r = true;
				break;
			case "f-":
				t.webkitExitFullScreen();
				r = false;
				break;
			case "f":
				r = (document.fullscreenElement === t);
				break;
			case "r":
				t.playbackRate = parseFloat(v1) ? parseFloat(v1) : 1;
				r = t.playbackRate;
				break;
			default:
				console.log(t);
				r = t;
				break;
		}
		typeof cb === "function" && cb(r)
		return r;
	}
})(jQuery);
