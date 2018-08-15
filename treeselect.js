layui.define(['layer', 'tree'], function (exports) {
    var $ = layui.jquery;
    var layer = layui.layer;
    var tree = layui.tree;
	var tNodes = {};
	var tips = '请选择',
        select_class = 'layui-form-select',
        initValue = '',
		win = $(window),
        thatInput;
    var treeselect = {
        // 渲染树形表格
        render: function (param) {
            // 检查参数
            if (!this.checkParam(param)) {
                return;
            }
			var treeid = 'selecttree_' + param.elem.replace("#", "");
            // 获取数据
            if (param.data) {
                this.init(param, param.data,treeid);
            } else {
                $.getJSON(param.url, param.where, function (res) {
                    this.init(param, res.data,treeid);
                });
            }
        },
        // 渲染表格
        init: function (param, data,treeid) {
			var tinput = $(param.elem);
			tNodes = data;
			// 补上id和pid字段
            for (var i = 0; i < tNodes.length; i++) {
               var tt = tNodes[i];
               if (!tt.id) {
                   if (!param.treeIdName) {
                       layer.msg('参数treeIdName不能为空', {icon: 5});
                       return;
                   }
                   tt.id = tt[param.treeIdName];
               }
               if (!tt.pid) {
                   if (!param.treePidName) {
                       layer.msg('参数treePidName不能为空', {icon: 5});
                       return;
                   }
                   tt.pid = tt[param.treePidName];
               }
			}
			var deepCopy = function(obj){
			    if(typeof obj != 'object'){
			        return obj;
			    }
			    var newobj = {};
			    for ( var attr in obj) {
			        newobj[attr] = deepCopy(obj[attr]);
			    }
			    return newobj;
			}
			// 对数据进行排序
        	var sort = function (tNodes,pid) {
			var nodes = [];
             	for (var i = 0; i < tNodes.length; i++) {
					var node = tNodes[i];
					if (node.pid == pid) {
						var newnode = {};
						newnode = deepCopy(node);
						if (param.treeDefaultClose) {
			               newnode.spread = true;
			            }
	                    newnode.children = sort(tNodes,node.id);
	                    nodes.push(newnode);
                	}
             	}
				return nodes;
         	};
        	tNodes = sort(tNodes,param.treeSpid);
			var hasRender = tinput.next('.layui-form-select'),
                disabled = tinput[0].disabled,
                value = tinput.value,
                placeholder = tinput.attr('placeholder') ? tinput.attr('placeholder') : tips;
            if (typeof tinput.attr('lay-ignore') === 'string') return tinput.show();
            //隐藏原控件
            tinput.hide();
            tinput.addClass('layui-input-treeselect');
            tinput.attr('data-treeid', treeid);
            //替代元素
			var select_disabled = disabled ? ' layui-select-disabled' : '';
            var reElem = $([
                '<div class="layui-unselect layui-form-select' + select_disabled + '">',
                '<div class="layui-select-title"><input type="text" placeholder="' +placeholder +
                '" id="' + treeid +'_text' +
                '" value="' +(value ? selected.html() : '') +
                '" readonly class="layui-input layui-unselect' + select_disabled +
                '">', '<i class="layui-edge"></i></div>',
                '<ul id="' + treeid + '" class="layui-anim layui-anim-upbit layui-tree"></ul>', '</div>'
            ].join(''));
            hasRender[0] && hasRender.remove(); //如果已经渲染，则Rerender
            tinput.after(reElem);
            this.events.call(this,param, reElem, treeid, disabled);
		},
        settext: function (data, val, input) {
           $.each(data,function (_, o) {
                   if (o.id === val) {
                       input.val(o.name);
                       return false;
                   }
                   if (o.children)
                       settext.call(this, o.children, val, input);
               });
        },
        hide: function(e, clear) {
            if (!$(e.target).parent().hasClass('layui-select-title') || clear) {
                $('.layui-form-select').removeClass('layui-form-selected layui-form-selectup');
                thatInput && initValue && thatInput.val(initValue);
            }
            thatInput = null;
        },
        events: function(param,reElem,treeid, disabled) {
            var title = reElem.find('.layui-select-title'),
                input = title.find('input'),
                tree = reElem.find('.layui-tree'),
                o = tNodes,
                defaultVal = $(param.elem).val();

            //如果控件有默认值，设置默认值
            if (defaultVal)
                settext.call(this, tNodes, defaultVal, input);
            if (disabled) return;
            //展开下拉
            var showDown = function () {
                var top = reElem.offset().top + reElem.outerHeight() + 5 - win.scrollTop(),
                    downHeight = win.height() - top - 13,
                    dlHeight = tree.outerHeight();
                    if (downHeight < 300)
                        tree.css("max-height", downHeight + "px");
                    reElem.addClass('layui-form-selected');
                    //上下定位识别
                    if (top + dlHeight > win.height() && top >= dlHeight) {
                        reElem.addClass('layui-form-selectup');
                    }
            };
            var hideDown = function() {
                reElem.removeClass('layui-form-selected layui-form-selectup');
                input.blur();
            };

            //点击标题区域
            title.on('click',
                function(e) {
                    reElem.hasClass('layui-form-selected')
                        ? (
                            hideDown.call()
                        )
                        : (
                            treeselect.hide(e, true),
                            showDown.call()
                        );
                    tree.find('.layui-select-none').remove();
                });

            //点击箭头获取焦点
            title.find('.layui-edge').on('click',
                function() {
                    input.focus();
                });

            //键盘事件
            input.on('keyup',
                    function(e) {
                        var keyCode = e.keyCode;
                        //Tab键
                        if (keyCode === 9) {
                            showDown();
                        }
                    })
                .on('keydown',
                    function(e) {
                        var keyCode = e.keyCode;
                        //Tab键
                        if (keyCode === 9) {
                            hideDown();
                        } else if (keyCode === 13) { //回车键
                            e.preventDefault();
                        }
                    });
            //渲染tree
            layui.tree({
                elem: "#" + treeid,
                click: function(obj) {
                    $(param.elem).val(obj.id).removeClass('layui-form-danger');
                    input.val(obj.name);
                    tree.find('.youyao-this').removeClass('youyao-this');
                    hideDown(true);
                    return false;
                },
                nodes: tNodes
            });
            //点击树箭头不隐藏
            tree.find(".layui-tree-spread").on('click',
                function() {
                    return false;
                });
            //关闭下拉
            $(document).off('click', this.hide).on('click', this.hide);
        },
		reset: function(filter) {
                var trees = filter ? $('*[lay-filter="' + filter + '"]') : $('.layui-input-treeselect');
                layui.each(trees,
                    function (_, one) {
                        var tinput = $(one);
                        var treeid = tinput.attr('data-treeid');
                        init.call(this, treeid);
                    });
        },
		// 检查参数
        checkParam: function (param) {
			if (!param)
            return reset.call(this,null);
	        if (param.filter)
	            return reset.call(this,param.filter);
            if (!param.data && param.data != 0) {
                layer.msg('参数data不能为空', {icon: 5});
                return false;
            }
            return true;
        }
		
	};
    layui.link(layui.cache.base + 'treeselect/treeselect.css');	
    exports('treeselect', treeselect);
});
