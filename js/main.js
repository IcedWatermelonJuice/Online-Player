function playM3u8(url, player) {
	if (Hls.isSupported()) {
		var hls = new Hls();
		var m3u8Url = decodeURIComponent(url)
		hls.loadSource(m3u8Url);
		hls.attachMedia(player);
		hls.on(Hls.Events.MANIFEST_PARSED, function() {
			player.play();
		});
	} else {
		var msg = "浏览器不支持MediaSource Extensions";
		console.log(msg);
		alert(msg);
	}
}

function checkUrl(url) {
	var res = false;
	if (url === "") {
		alert("输入地址为空!");
	} else if ((url.search("https://") === 0) || (url.search("http://") === 0)) {
		res = true;
	} else {
		alert("输入地址格式不正确!");
	}
	return res;
}

function playBtn() {
	var url = document.getElementById("url_box").value;
	var player = document.getElementById('video_player');
	if (checkUrl(url)) {
		playM3u8(url, player);
		console.log("加载视频资源:" + url);
	}
}
window.onload = function() {
	var ub = document.getElementById("url_box");
	var initvalue = "请输入http、https开头的M3U8播放地址";
	ub.value = initvalue;
	ub.style.color = "gray";
	ub.onfocus = function() {
		if (ub.value === initvalue) {
			ub.value = "";
			ub.style.color = "";
			ub.style.borderColor = "rgba(14,144,210,.9)";
		}
	}
	ub.onblur = function() {
		if (!ub.value) {
			ub.value = initvalue;
			ub.style.color = "gray";
			ub.style.borderColor = "rgba(14,144,210,.8)";
		}
	}
	var btn = document.getElementById("url_btn");
	btn.onmouseover = function() {
		btn.style.borderColor = "rgba(14,144,210,.9)";
		btn.style.backgroundColor = "rgba(14,144,210,.9)";
	}
	btn.onmouseleave = function() {
		btn.style.borderColor = "rgba(14,144,210,.8)";
		btn.style.backgroundColor = "rgba(14,144,210,.8)";
	}
}
