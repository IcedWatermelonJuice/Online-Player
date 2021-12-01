function playM3u8(url, player) {
	if (Hls.isSupported()) {
		var hls = new Hls();
		var m3u8Url = decodeURIComponent(url)
		hls.loadSource(m3u8Url);
		hls.attachMedia(player);
		hls.on(Hls.Events.MANIFEST_PARSED, function() {
			//console.log("M3U8播放器加载成功!");
		});
	} else {
		var msg = "浏览器不支持MediaSource Extensions,无法加载M3U8播放器!";
		console.log(msg);
		alert(msg);
	}
}

function checkUrl(url, alertFlag) {
	url = url.replace(/\s+/g, "");
	if (!
		/^((http|https|file):\/\/)?(([-A-Za-z0-9+&@#/%?=~_|!:,.;]+-[-A-Za-z0-9+&@#/%?=~_|!:,.;]+|[-A-Za-z0-9+&@#/%?=~_|!:,.;]+)\.)+([-A-Za-z0-9+&@#/%?=~_|!:,.;]+)[/\?\:]?.*$/i
		.test(url)) {
		if (alertFlag) {
			alert("无法识别的URL");
		}
		return false;
	}
	url = url.replace(/^((http|https):)/, "");
	return /.m3u8/i.test(url) ? "m3u8" : "others";
}

function loadVideo() {
	var player = document.getElementById('video_player');
	var url = document.getElementById("url_box").value;
	url = url.replace(/\s+/g, "");
	var sourceType = checkUrl(url, true);
	try {
		console.log("正在加载视频资源:" + url);
		player.style.width = player.clientWidth + "px";
		player.style.height = player.clientHeight + "px";
		if (sourceType === "m3u8") {
			playM3u8(url, player);
		} else {
			player.src = url;
		}
		console.log("视频资源加载成功");
	} catch (e) {
		console.log("找不到视频资源或不支持该视频格式!");
	}
}

function playBtn() {
	var player = document.getElementById('video_player');
	loadVideo();
	if (player.src !== "") {
		player.play();
	}
}

window.onload = function() {
	var urlBox = document.getElementById("url_box");
	var initValue = "请输入视频播放地址";
	urlBox.value = initValue;
	urlBox.style.color = "gray";
	urlBox.onfocus = function() {
		if (urlBox.value === initValue) {
			urlBox.value = "";
			urlBox.removeAttribute("style");
		}
	}
	urlBox.onblur = function() {
		if (!urlBox.value) {
			urlBox.value = initValue;
			urlBox.style.color = "gray";
		}
	}
	urlBox.onkeydown = function(event) {
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
	var url = location.href.split("?url=")[1];
	if (url) {
		urlBox.value = url;
		urlBox.removeAttribute("style");
		loadVideo();
	}
}
