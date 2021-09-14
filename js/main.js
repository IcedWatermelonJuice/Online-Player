function playM3u8(url, player) {
	if (Hls.isSupported()) {
		var hls = new Hls();
		var m3u8Url = decodeURIComponent(url)
		hls.loadSource(m3u8Url);
		hls.attachMedia(player);
		hls.on(Hls.Events.MANIFEST_PARSED);
	} else {
		var msg = "浏览器不支持MediaSource Extensions,无法播放M3U8视频!";
		console.log(msg);
		alert(msg);
	}
}

function checkUrl(url) {
	var res = false;
	if (url === "") {
		alert("输入地址为空!");
	} else if ((url.search("https://") === 0) || (url.search("http://") === 0) || ((url.search("file://") === 0) && (
			location.href.search("http") !== 0))) {
		if (url.search(".m3u8") !== -1) {
			res = "m3u8";
		} else {
			res = "others";
		}
	} else {
		alert("输入地址格式不正确!");
	}
	return res;
}

function loadVideo() {
	var player = document.getElementById('video_player');
	var url = document.getElementById("url_box").value;
	url = url.trim();
	var sourceType = checkUrl(url);
	if (sourceType === "m3u8") {
		playM3u8(url, player);
		console.log("加载视频资源:" + url);
	} else if (sourceType === "others") {
		try {
			player.src = url;
			console.log("加载视频资源:" + url);
		} catch (e) {
			console.log("找不到视频资源或不支持该视频格式!");
		}
	}
}
function playBtn() {
	loadVideo();
	document.getElementById('video_player').play();
}
window.onload = function() {
	var ub = document.getElementById("url_box");
	var initvalue = "请输入视频播放地址";
	ub.value = initvalue;
	ub.style.color = "gray";
	ub.onfocus = function() {
		if (ub.value === initvalue) {
			ub.value = "";
			ub.removeAttribute("style");
		}
	}
	ub.onblur = function() {
		if (!ub.value) {
			ub.value = initvalue;
			ub.style.color = "gray";
		}
	}
	ub.onkeydown = function(event) {
		if (event.keyCode === 13) {
			document.getElementById("url_btn").click();
		}
	}
	var btn = document.getElementById("url_btn");
	btn.onmouseover = function() {
		btn.setAttribute("class", "btn_extra_css_1");
	}
	btn.onmouseleave = function() {
		btn.setAttribute("class", "btn_extra_css_0");
	}
	var u=location.href;
	var us="url=";
	var uf=u.search(us);
	if(uf!==-1){
		u=u.slice(uf+us.length);
		ub.value=u;
		ub.removeAttribute("style");
		loadVideo();
	}
}
