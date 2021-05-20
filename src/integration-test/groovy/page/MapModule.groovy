package page

class MapModule extends ModalModule {

    static content = {

    }

    def drawBBox() {
        interact {
            moveToElement($('.angular-leaflet-map'))
            moveByOffset(50, 50)
            clickAndHold()
            moveByOffset(20, 20)
            click()
        }
    }

    def drawCircle() {
        interact {
            moveToElement($('.angular-leaflet-map'))
            moveByOffset(350, 20)
            clickAndHold()
            moveByOffset(100, 100)
            click()
        }
    }

    /**
     * Draw a point after pan x,y
     * @param x
     * @param y
     * @return
     */
    def drawPoint(x, y) {
        interact {
            moveToElement($('.angular-leaflet-map'))
            moveByOffset(x, y)
            click()
        }
    }

}
