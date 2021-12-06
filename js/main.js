var link = {
	check: function(url) {
		if (!
			/^((http|https|file):\/\/)?(([-A-Za-z0-9+&@#/%?=~_|!:,.;]+-[-A-Za-z0-9+&@#/%?=~_|!:,.;]+|[-A-Za-z0-9+&@#/%?=~_|!:,.;]+)\.)+([-A-Za-z0-9+&@#/%?=~_|!:,.;]+)[/\?\:]?.*$/i
			.test(url)) {
			alert("无法识别的URL");
			return false;
		}
		url = url.replace(/^((http|https):)/, "");
		var res = "default";
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
					player = play.default(url, player);
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
		this.check(url);
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
		this.check(url);
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
	default: function(url, player) {
		if (!url || !player) {
			console.log("play.default(url,player)参数错误:url必选,player必选");
			return false;
		}
		player = this.init(player);
		url = link.convert(url);
		player.src = url;
		return player;
	},
	check: function(url) {
		if (location.hostname.search(".rth.") !== -1) {
			location.href = "https://icedwatermelonjuice.github.io/Online-Player?url=" + url;
		}
	},
	on: function() {
		this.load(document.getElementById("url_box").value);
	}
}
var log = {
	get: function(direction) {
		var data = localStorage.getItem("playHistory");
		try {
			if (direction === false) {
				return JSON.parse(data).reverse();
			} else {
				return JSON.parse(data)
			}

		} catch (e) {
			return [];
		}
	},
	display: function(data) {
		if (!data) {
			data = this.get();
		}
		var sum = 5; //显示数量
		var temp = [];
		for (let i in data) {
			if (temp.indexOf(data[i].url) === -1) {
				let num = temp.push(data[i].url);
				if (num >= sum) {
					break;
				}
			}
		}
		temp = temp.slice(0, sum);
		var html = "";
		for (let i in temp) {
			html += "<option value='" + temp[i] + "'/>";
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
		data.unshift({
			"url": url,
			"time": time
		});
		data = data.slice(0, 50);
		localStorage.setItem("playHistory", JSON.stringify(data));
		this.display(data);
	},
	clear: function() {
		localStorage.setItem("playHistory", "");
	},
	msg: function(direction) {
		var data = this.get(direction);
		var msg = "";
		if (data.length === 0) {
			return "无播放历史";
		}
		msg = "共" + data.length + "条播放历史(" + (direction === false) ? "正序排列):" : "倒序排列):";
		for (let i = 0; i < data.length; i++) {
			let logIndex = (i + 1) < 10 ? "0" + (i + 1) : (i + 1);
			msg += "\n(" + logIndex + ") 时间:" + data[i].time + ",地址:" + data[i].url;
		}
		return msg;
	},
	alert: function(direction) {
		alert(this.msg(direction));
	},
	print: function(direction) {
		console.log(this.msg(direction));
	},
	copy: function(direction) {
		var copyBox = document.createElement("input");
		copyBox.value = this.msg(direction);
		document.body.appendChild(copyBox);
		copyBox.select();
		document.execCommand('copy');
		copyBox.remove();
		console.log("播放历史已导出到剪贴板");
	},
	play: function(index, direction) {
		var data = this.get(direction);
		data = index <= data.length ? data[index - 1].url : ""
		if (!data) {
			alert("播放记录不存在");
		}
		document.getElementById("url_box").value = data;
		document.getElementById("url_box").removeAttribute("style");
		document.getElementById("url_btn").click();
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
	instruct: function() {
		var logoClickNum = 0;
		document.getElementById("logo_box").addEventListener("click", function() {
			logoClickNum += 1;
			if (logoClickNum >= 3) {
				logoClickNum = 0;
				let instruction = prompt("请输入指令");
				instruction = instruction ? instruction.trim() : false;
				if (instruction) {
					try {
						eval(instruction);
					} catch (e) {
						console.log("非法指令");
					}
				}
			}
		})
	},
	onload: function() {
		this.init();
		this.pretreat();
		this.instruct();
	}
}
window.onload = function() {
	page.onload();
}
