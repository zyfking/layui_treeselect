# layui_treeselect
Layui  树形下拉框

例子：
<div class="layui-input-inline" style="width: 210px;">
       <input type="text" id="treeselect" lay-verify="required" autocomplete="off" placeholder="请选择部门"  class="layui-input" name="treeselect">
</div>
 <script>   
 layui.config({
        base: '/static/module/'
    }).extend({
		  treeselect: 'treeselect/treeselect'
    }).use(['table','treeselect'], function () {
      var $ = layui.jquery;
          var table = layui.table;
          var treeselect = layui.treeselect;
          var renderSelect = function (nodes){
          treeselect.render(
                {
                    treeSpid: '-1',
                    treeIdName: 'departid',
                    treePidName: 'parentid',
                    treeDefaultClose: true,
                    elem: '#treeselect',
                    data: nodes
                });
          };
          $.ajax({
             type: "POST",
             url: "/depart/getnodes",
             dataType: 'json',
             success: function(data) {
                 if(data.code==0){
                    zNodes = data.data;
                    renderTable(zNodes); 
					renderSelect(zNodes);
                 }
             }
         }); 
 });
</script>
