function initMedia(player) {
	var videoBox = document.getElementById("video_box");
	var oldPlayer = document.getElementById("real_video_player");
	var newPlayer = player.cloneNode(true);
	if (oldPlayer) {
		oldPlayer.remove();
	}
	newPlayer.id = "real_video_player";
	newPlayer.style = "width:100%;height:" + getComputedStyle(videoBox).width.replace("px", "") / 2 + "px";
	player.style.display = "none";
	videoBox.appendChild(newPlayer);
	return newPlayer;
}

function playM3u8(url, player) {
	player = initMedia(player);
	if (Hls.isSupported()) {
		var hlsPlayer = new Hls();
		hlsPlayer.loadSource(url);
		hlsPlayer.attachMedia(player);
		hlsPlayer.on(Hls.Events.MANIFEST_PARSED, function() {
			//console.log("M3U8播放器加载成功!");
		});
	} else {
		var msg = "浏览器不支持MediaSource Extensions,无法加载M3U8播放器!";
		console.log(msg);
		alert(msg);
	}
	return player;
}

function playFlv(url, player) {
	player = initMedia(player);
	if (flvjs.isSupported()) {
		var flvPlayer = flvjs.createPlayer({
			type: 'flv',
			url: url
		});
		flvPlayer.attachMediaElement(player);
		flvPlayer.load();
	} else {
		var msg = "浏览器不支持MediaSource Extensions,无法加载Flv播放器!";
		console.log(msg);
		alert(msg);
	}
	return player;
}

function checkUrl(url) {
	url = url.replace(/\s+/g, "");
	if (!
		/^((http|https|file):\/\/)?(([-A-Za-z0-9+&@#/%?=~_|!:,.;]+-[-A-Za-z0-9+&@#/%?=~_|!:,.;]+|[-A-Za-z0-9+&@#/%?=~_|!:,.;]+)\.)+([-A-Za-z0-9+&@#/%?=~_|!:,.;]+)[/\?\:]?.*$/i
		.test(url)) {
		alert("无法识别的URL");
		return false;
	}
	url = url.replace(/^((http|https):)/, "");
	var res = "others";
	res = /.m3u8/i.test(url) ? "m3u8" : res;
	res = /.flv/i.test(url) ? "flv" : res;
	return res;
}

function getUrl(type) {
	if (type === "url") {
		return location.href.split("?url=")[1];
	}
	return document.getElementById("url_box").value;
}

function loadVideo(url) {
	var player = document.getElementById('video_player');
	url = url.replace(/\s+/g, "");
	var sourceType = checkUrl(url);
	if (!sourceType) {
		return false;
	}
	try {
		console.log("正在加载视频资源:" + url);
		url = decodeURIComponent(url);
		switch (sourceType) {
			case "m3u8":
				player = playM3u8(url, player);
				break;
			case "flv":
				player = playFlv(url, player);
				break;
			default:
				player.src = url;
				break;
		}
		player.play();
		console.log("视频资源加载成功");
		addHistory("save", url);
	} catch (e) {
		console.log("找不到视频资源或不支持该视频格式!");
	}
}

function playBtn() {
	loadVideo(document.getElementById("url_box").value);
}

function addHistory(type, url) {
	if(!type||(type==="save"&&!url)){
		console.log("参数缺失:addHistory(type, url)")
		return false;
	}
	var history = localStorage.getItem("playHistory");
	history = history ? JSON.parse(history) : [];
	switch (type) {
		case "save":
			for (let i in history) {
				if (history[i].url === url) {
					history.splice(i, 1);
				}
			}
			history.unshift({
				"url": url,
				"time": Date()
			});
			history = history.slice(0, 5);
			localStorage.setItem("playHistory", JSON.stringify(history));
		case "insert":
			var list = document.getElementById("play_history");
			var html = "";
			for (let i in history) {
				html += "<option value='" + history[i].url + "'/>";
			}
			list.innerHTML = html;
			break;
	}
}

function initPage() {
	addHistory("insert");
	var urlBox = document.getElementById("url_box");
	var initValue = "请输入视频播放地址(支持m3u8、flv、mp4等)";
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
}

window.onload = function() {
	initPage();
	var urlBox = document.getElementById("url_box");
	var urlData = getUrl("url");
	if (urlData) {
		urlBox.value = urlData;
		urlBox.removeAttribute("style");
		loadVideo(urlData);
	}
}
