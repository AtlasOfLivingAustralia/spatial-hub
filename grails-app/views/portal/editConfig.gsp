<!doctype html>
<html lang="en">

<head>
    <meta name="layout" content="plain"/>

    <asset:javascript src="ace.js" />
    <asset:javascript src="ace-diff.js" />
    <asset:javascript src="ace-diff-patch.js" />
</head>

<body>
<form method="POST">
    <g:if test="${error}"><span style="color: red; display:block; text-align: center">${error}</span></g:if>
    <br/>

    <label>Edit config.json on the left hand side</label>

    <div style="position:absolute;right:0px">
        <label>Select config file to view for on the right hand side</label>
        <g:select name="files" from="${versions}" onchange="updateView()" ></g:select>
    </div>

    <div id="flex-container">
        <div><div id="editor1"></div></div>
        <div id="gutter"></div>
        <div><div id="editor2"></div></div>
    </div>

    <textarea id="config" name="config" style="display: none;">${config}</textarea>
    <button type="submit" click="saveConfig">Save</button>

    <input id="type" name="type" type="hidden" value="${type}">
</form>
<textarea id="content-2" style="display: none;">${config}</textarea>

<style>
    #flex-container {
    display: flex;
    display: -webkit-flex;
    flex-direction: row;
    position: absolute;
    bottom: 0;
    width: 100%;
    top: 80px !important;
    left: 0px;

    /* these 3 lines are to prevents an unsightly scrolling bounce affect on Safari */
    /*height: 100%;*/
    width: 100%;
    overflow: auto;
    }
    #flex-container>div {
    flex-grow: 1;
    -webkit-flex-grow: 1;
    position: relative;
    }
    #flex-container>div#gutter {
    flex: 0 0 60px;
    -webkit-flex: 0 0 60px;
    border-left: 1px solid #999999;
    border-right: 1px solid #999999;
    background-color: #efefef;
    overflow: hidden;
    }
    #gutter svg {
    background-color: #efefef;
    }

    #editor1 {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
    }
    #editor2 {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
    }
    .acediff-diff {
    background-color: #d8f2ff;
    border-top: 1px solid #a2d7f2;
    border-bottom: 1px solid #a2d7f2;
    position: absolute;
    z-index: 4;
    }
    .acediff-diff.targetOnly {
    height: 0px !important;
    border-top: 1px solid #a2d7f2;
    border-bottom: 0px;
    position: absolute;
    }
    .acediff-connector {
    fill: #d8f2ff;
    stroke: #a2d7f2;
    }

    .acediff-copy-left {
    float: right;
    }
    .acediff-copy-right,
    .acediff-copy-left {
    position: relative;
    }
    .acediff-copy-right div {
    color: #000000;
    text-shadow: 1px 1px #ffffff;
    position: absolute;
    margin: -3px 2px;
    cursor: pointer;
    }
    .acediff-copy-right div:hover {
    color: #004ea0;
    }
    .acediff-copy-left div {
    color: #000000;
    text-shadow: 1px 1px #ffffff;
    position: absolute;
    right: 0px;
    margin: -3px 2px;
    cursor: pointer;
    }
    .acediff-copy-left div:hover {
    color: #c98100;
    }

</style>
<script >
    var differ = new AceDiff({
        mode: "ace/mode/json",
        left: {
            id: "editor1",
            content: $("#config").html()
        },
        right: {
            id: "editor2",
            content: $("#content-2").html(),
            editable: false
        },
        classes: {
            gutterID: "gutter"
        }
    });

    differ.editors.left.ace.session.on("change", function () {
        $("#config").val(differ.editors.left.ace.session.getValue());
    });

    var updateView = function() {
        var fileSelection = $('select[name="files"]')[0].value;
        $.get("${createLink(controller: 'portal', action: 'config')}/${type}?text=true&version=" + fileSelection.replace("/data/spatial-hub/config/", "").
        replace("view-config.", "").replace("menu-config.", "").replace(".json", ""),function( data ) {
            differ.editors.right.ace.session.setValue(data)
        });
    }

    var viewDefault = function() {
        $.get("${createLink(controller: 'portal', action: 'config')}/${type}?text=true&version=default",function( data ) {
            differ.editors.right.ace.session.setValue(data)
        });
    }
</script>

</body>

</html>