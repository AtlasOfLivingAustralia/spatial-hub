package page

import geb.Module
/**
 * Phylogenetic diversity
 */

class ToolPhylogeneticModule extends Module {

    static content = {
        pdListTable(required: false) { $("table[testTag='phylogeneticList']") }
    }

    def selectStudy(id) {
        def td = pdListTable.find("tr td[testTag='studyId'", text: id)
        //def td = $("table[testTag='phylogeneticList']").find(" tr td[testTag='studyId'", text: id)
        td.siblings().children("input").click()
    }
}
