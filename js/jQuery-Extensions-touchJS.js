// ==UserScript==
// @name         jQuery-Extensions-touchJS
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  jQuery-Extensions-touchJS是一个非常简单的jQuery touch扩展，用于适配移动端的常用touch操作（点击tab、双击dbTab、长按longPress、长按终止longPressCancel、滑动swipe以及具体滑动方向left right up down）
// @author       tutu辣么可爱(greasyfork)/IcedWatermelonJuice(github)
// @grant        none
// ==/UserScript==
(function() {
	if (typeof $ !== "function" && typeof jQuery !== "function") {
		console.error("jQuery-Extensions-touchJS 缺少jQuery依赖")
		return false;
	}

	function jsonExtend(json1 = {}, json2 = {}, json3 = {}) {
		return $.extend(json1, json2, json3)
	}

	function getFnName(fn) {
		if (fn.name) {
			return fn.name
		} else {
			var fnstr = fn.toString().match(/function\s*([^(]*)\(/);
			return fnstr ? fnstr[1] : null
		}
	}
	$.fn.touch = function(evt, fn, fnName = null) {
		// 预处理
		var $that = $(this),
			that = $that[0];
		that.libForTouchJsExt = that.libForTouchJsExt ? that.libForTouchJsExt : {};
		var fnMap = jsonExtend({}, that.libForTouchJsExt),
			fnKeyArray = ["swipe", "left", "right", "up", "down", "tap", "dbTap", "longPress",
				"longPressCancel"
			]; //可用的事件名

		function addFn(e, f, n) {
			if (fnKeyArray.indexOf(e) < 0) {
				let msg = "$.touch(evt, fn, fnName)参数错误，指定事件(evt)不支持。支持的事件列表:";
				console.error(msg + fnKeyArray.toString());
				return false;
			}
			fnMap[e] = fnMap[e] ? fnMap[e] : {};
			if (!n) { //无方法名，获取并使用默认数字id
				defAry = Object.keys(fnMap[e]).filter((v) => {
					/^\d{1,}$/.test(v)
				});
				//获取可用数字id
				if (!fnMap[e][defAry.length]) { //假设id连续，长度就是新id
					n = defAry.length
				} else { //说明id不连续（手动删过事件方法），寻找中间缺少的id
					defAry.sort((a, b) => {
						return a - b
					});
					for (let i = 0; i < defAry.length; i++) {
						if (defAry[i] !== i) {
							n = i;
							break;
						}
					}
				}
			}
			fnMap[e][n] = f
			return true
		}
		if (typeof evt === "string" && typeof fn === "function") {
			if (!addFn(evt, fn, fnName ? fnName : getFnName(fn))) {
				return false
			}
		} else if (typeof evt === "object" && !fn) {
			for (let e in evt) {
				if (!addFn(e, evt[e], getFnName(evt[e]))) {
					return false
				}
			}
		}
		that.libForTouchJsExt = jsonExtend({}, that.libForTouchJsExt, fnMap);
		//添加事件
		if (!that.libForTouchJsExt.eventLoaded) {
			that.libForTouchJsExt.eventLoaded = true;
			var execFn = function(evt, params = {}) { //执行方法
				if (!evt) {
					return false
				}
				if (/left|right|up|down/.test(evt)) {
					evt = [evt, "swipe"];
				} else {
					evt = [evt];
				}
				params.target = that;
				evt.forEach((e) => {
					e = that.libForTouchJsExt[e] ? that.libForTouchJsExt[e] : {};
					for (let i in e) {
						if (typeof e[i] === "function") {
							e[i](params);
						}
					}
				})
			}
			var lp_timer = -1,
				tap_timer = -1,
				lp_flag = false,
				swipe_flag = false,
				tap_sum = 0,
				pos = {
					x: 0,
					y: 0
				};
			that.addEventListener('touchstart', ts, false);
			that.addEventListener('touchmove', tm, false);
			that.addEventListener('touchend', te, false);
			//具体实现
			function dir(past, now) { //判方向
				if (Math.abs(past.x - now.x) > Math.abs(past.y - now.y)) {
					if (now.x > past.x) {
						return "right"
					} else {
						return "left"
					}
				} else {
					if (now.y > past.y) {
						return "down"
					} else {
						return "up"
					}
				}
				return null
			}

			function ts(e) { //touchstart
				e = e || window.event
				lp_timer !== -1 && clearTimeout(lp_timer);
				lp_timer = -1;
				lp_flag = false;
				swipe_flag = false;
				pos = {
					x: e.changedTouches[0].clientX,
					y: e.changedTouches[0].clientY
				}
				lp_timer = setTimeout(function() {
					if (!swipe_flag) {
						lp_timer = -1;
						lp_flag = true;
						execFn("longPress", {
							0: pos
						});
					}
				}, 600)
			}

			function tm(e) { //touchmove
				var e = e || window.event;
				let temp = {
					x: e.changedTouches[0].clientX,
					y: e.changedTouches[0].clientY
				}
				if (!lp_flag && (Math.abs(pos.x - temp.x) > 10 || Math.abs(pos.y - temp.y) > 10)) {
					swipe_flag = true;
					lp_timer !== -1 && clearTimeout(lp_timer);
					lp_timer = -1;
					execFn(dir(pos, temp), {
						0: pos,
						1: temp
					});
				}
				pos = temp;
			}

			function te(e) { //touchend
				var e = e || window.event;
				lp_timer !== -1 && clearTimeout(lp_timer);
				tap_timer !== -1 && clearTimeout(tap_timer);
				lp_timer = -1;
				tap_timer = -1;
				if (lp_flag) {
					execFn("longPressCancel", {
						0: pos
					});
				} else if (!swipe_flag) {
					tap_sum += 1;
					if (tap_sum >= 2) {
						tap_sum = 0;
						execFn("dbTap", {
							0: pos
						});
					} else {
						tap_timer = setTimeout(() => {
							tap_sum = 0;
							execFn("tap", {
								0: pos
							});
						}, 200)
					}
				}
			}
		}
		return $that
	}
	$.fn.unbindTouch = function(evt, fnName = null) {
		var $that = $(this),
			that = $that[0];
		if (typeof evt === "string") {
			that.libForTouchJsExt = that.libForTouchJsExt ? that.libForTouchJsExt : {};
			if (that.libForTouchJsExt[evt]) {
				if (fnName) {
					fnName = typeof fnName === "function" ? getFnName(fnName) : fnName;
					delete that.libForTouchJsExt[evt][fnName];
				} else {
					delete that.libForTouchJsExt[evt]
				}
			}
		}
		return $that
	}
})(jQuery);
