var link = {
	check: function(url) {
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
	},
	get: function(type) {
		var res;
		if (type === "url") {
			res = location.href.split("?url=")[1];
		} else {
			res = document.getElementById("url_box").value;
		}
		return res ? res.replace(/\s+/g, "") : "";
	},
	convert: function(url) {
		if (!url) {
			console.log("link.convert(url)参数错误:url必选");
			return false;
		}
		var urlProtocol = /http|https/i.test(location.protocol) ? location.protocol : false;
		urlProtocol = !urlProtocol && /^(http|https):/i.test(url) ? url.split("//")[0] : false;
		urlProtocol = urlProtocol ? urlProtocol : "https:";
		return urlProtocol + "//" + url.replace(/^((http|https):)?\/\//, "");
	}
}
var play = {
	load: function(url) {
		url = url ? url : link.get();
		var player = document.getElementById('video_player');
		var sourceType = link.check(url);
		if (!sourceType) {
			return false;
		}
		try {
			console.log("正在加载视频资源:" + url);
			url = decodeURIComponent(url);
			switch (sourceType) {
				case "m3u8":
					player = play.m3u8(url, player);
					break;
				case "flv":
					player = play.flv(url, player);
					break;
				default:
					player.src = url;
					break;
			}
			player.play();
			log.add(url);
			console.log("视频资源加载成功");
		} catch (e) {
			console.log("找不到视频资源或不支持该视频格式!");
		}
	},
	init: function(player) {
		if (!player) {
			console.log("play.init(player)参数错误:player必选");
			return false;
		}
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
	},
	m3u8: function(url, player) {
		if (!url || !player) {
			console.log("play.m3u8(url,player)参数错误:url必选,player必选");
			return false;
		}
		player = this.init(player);
		url = link.convert(url);
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
	},
	flv: function(url, player) {
		if (!url || !player) {
			console.log("play.flv(url,player)参数错误:url必选,player必选");
			return false;
		}
		player = this.init(player);
		url = link.convert(url);
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
	},
	on: function() {
		this.load(document.getElementById("url_box").value);
	}
}
var log = {
	get: function() {
		var data = localStorage.getItem("playHistory");
		try {
			return JSON.parse(data)
		} catch (e) {
			return [];
		}
	},
	display: function(data) {
		if (!data) {
			data = this.get();
		}
		var html = "";
		for (let i in data) {
			html += "<option value='" + data[i].url + "'/>";
		}
		document.getElementById("play_history").innerHTML = html;
	},
	add: function(url, time) {
		url = url ? url : link.get();
		time = time ? time : Date();
		if (!url) {
			console.log("log.add(url,time)参数错误:url必选,time可选");
			return false;
		}
		var data = this.get();
		for (let i in data) {
			if (data[i].url === url) {
				data.splice(i, 1);
			}
		}
		data.unshift({
			"url": url,
			"time": time
		});
		data = data.slice(0, 5);
		localStorage.setItem("playHistory", JSON.stringify(data));
		this.display(data);
	},
	clear: function() {
		localStorage.setItem("playHistory", "");
	},
	msg: function() {
		var data = this.get();
		var msg = "";
		for (let i in data) {
			msg += "\n时间:" + data[i].time + ",地址:" + data[i].url;
		}
		msg = msg ? "播放历史(按时间近-->远排序):" + msg : "无播放历史"
		return msg;
	},
	alert: function() {
		var msg = this.msg();
		alert(msg);
	},
	console: function() {
		var msg = this.msg();
		console.log(msg);
	}
}
var page = {
	init: function() {
		log.display();
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
		btn.onclick = function() {
			play.on();
		}
	},
	pretreat: function() {
		var urlBox = document.getElementById("url_box");
		var url = link.get("url");
		if (url) {
			urlBox.value = url;
			urlBox.removeAttribute("style");
			play.load(url);
		}
	},
	onload: function() {
		this.init();
		this.pretreat();
	}
}
window.onload = function() {
	page.onload();
}
