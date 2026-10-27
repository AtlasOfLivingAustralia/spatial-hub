<?xml version="1.0" encoding="ISO-8859-1"?>
<StyledLayerDescriptor version="1.0.0" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc"
  xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd">
  <NamedLayer>
    <Name>alastyles</Name>
    <UserStyle>
      <Name>alastyles</Name>
      <Title>ALA MaxEnt distribution</Title>
      <FeatureTypeStyle>
        <Rule>
          <RasterSymbolizer>
            <ColorMap type="intervals" extended="true">
              <ColorMapEntry color="#FFFFFF" quantity="-9999" opacity="0.0" />
              <ColorMapEntry color="#FFFFFF" quantity="0.0000" opacity="0.0" />
              <ColorMapEntry color="#CCFF00" quantity="0.0001" opacity="1"/>
              <ColorMapEntry color="#CCCC00" quantity="0.2" opacity="1" />
              <ColorMapEntry color="#CC9900" quantity="0.4" opacity="1" />
              <ColorMapEntry color="#CC6600" quantity="0.6" opacity="1" />
              <ColorMapEntry color="#CC3300" quantity="0.8" opacity="1" />
              <ColorMapEntry color="#0000FF" quantity="1.0" opacity="1"/>
            </ColorMap>
          </RasterSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>