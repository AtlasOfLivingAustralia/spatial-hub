package page

import org.apache.commons.io.IOUtils

class AddAreaModule extends ModalModule {
    static content = {

        addAreaLegend { $("div[testTag='createAreaLegend']") }

        newAreaNameInput { $("input[testTag='newAreaName']")}
        newAreaWktTextarea { $("textarea[testTag='newAreaWKT']")}
        nextInNewAreaLegendBtn  { $("button[testTag='nextInNewAreaLegend']")}

        //radio options
        gazRadioBtn {$("input[type='radio'][value='gazetteer']")}
        bboxRadioBtn {$("input[type='radio'][value='drawBoundingBox']")}
        polygonRadioBtn {$("input[type='radio'][value='drawPolygon']")}
        circleRadioBtn {$("input[type='radio'][value='drawPointRadius']")}
        pointOnLayerRadioBtn {$("input[type='radio'][value='pointOnLayer']")}
        environmentalEnvelopeRadioBtn {$("input[type='radio'][value='environmentalEnvelope']")}

        importKmlRadioBtn{$("input[type='radio'][value='importKML']")}
        importShapefileRadioBtn{$("input[type='radio'][value='importShapefile']")}
        importWktRadioBtn{$("input[type='radio'][value='wkt']")}
        mergeAreaRadioBtn{$("input[type='radio'][value='mergeArea']")}

        uploadFileBtn { $("button[testTag='uploadFile']") }

        //gaz
        gazInput {$("input#gazAutoComplete")}

        gazAutocompleteList(required:false) { $("li.autocomplete-item.ui-menu-item a") }

        //SHP
        importAreaName {$("input[testTag='importAreaName']")}
        newAreasInList  {$("input[testTag='newAreaInList']")}

        //wkt
        wktAreaNameInput {$("input[testTag='wktAreaName']")}
        wktAreaDataTextarea {$("textarea[testTag='wktAreaData']")}

        //Option modal
        createdAreasCheckbox { $("input[type='checkbox'][testTag='selectArea']")}


    }

    def gazAutoListCheckbox(name) {
        $("li.autocomplete-item.ui-menu-item[isField] a").find("text": startsWith(name))[0]
    }

    def gazAutoList(name) {
        return $("li.autocomplete-item.ui-menu-item[field] a").find("text": startsWith(name))[0]
    }

    /**
     * SP uses NG file to upload file. GEB needs to use JS to call Angular function in SP
     * Upload a text file
     * @param file : the absolute file path
     * @return
     */
    def uploadTextFile(file) {
         // First argument is the content
        //file = new File(['koppen.kml'], '/data/spatial-hub/test/koppen.kml', {type: 'text/plain'});
        //angular.element("div[testTag='addAreaModal']").scope().uploadFile([file])

        ClassLoader classloader = Thread.currentThread().getContextClassLoader();
        InputStream is = classloader.getResourceAsStream(file);
        String result = IOUtils.toString(is, "UTF-8");

        return js.exec( result, file, "file = new File([arguments[0]], arguments[1]);" +
                "angular.element(\"div[testTag='addAreaModal']\").scope().uploadFile([file]);")
    }

    /**
     * SP uses NG file to upload file. GEB needs to use JS to call Angular function in SP
     * Upload a binary file
     * @param file
     * @param type : file type: e.g. application/zip
     * @return
     */
    def uploadRawFile(file, type) {
        ClassLoader classloader = Thread.currentThread().getContextClassLoader();
        InputStream is = classloader.getResourceAsStream(file);
        byte[] fileContents = IOUtils.toByteArray(is);

        //byte[] fileContents = new File(file).bytes
        return js.exec( fileContents, file, type, "file = new File([new Blob([new Uint8Array(arguments[0])])], arguments[1], {type: arguments[2]});" +
                "angular.element(\"div[testTag='addAreaModal']\").scope().uploadFile([file]);")

    }
}
