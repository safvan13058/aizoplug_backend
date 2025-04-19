const Swaggerdoc = {


  "/dashboard/api/add/station": {
    "post": {
      "summary": "Add a new charging station",
      "tags": ["Charging Stations"],
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "name": {
                  "type": "string",
                  "example": "Downtown EV Hub"
                },
                "latitude": {
                  "type": "number",
                  "example": 37.7749
                },
                "longitude": {
                  "type": "number",
                  "example": -122.4194
                },
                "amenities": {
                  "type": "string",
                  "example": "WiFi, Restrooms, Coffee"
                },
                "contact_info": {
                  "type": "string",
                  "example": "123-456-7890"
                },
                "dynamic_pricing": {
                  "type": "boolean",
                  "example": true
                }
              },
              "required": [
                "name",
                "latitude",
                "longitude",
                "amenities",
                "contact_info",
                "dynamic_pricing"
              ]
            }
          }
        }
      },
      "responses": {
        "201": {
          "description": "Charging station created successfully",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "message": {
                    "type": "string",
                    "example": "Charging station created successfully"
                  },
                  "station": {
                    "$ref": "#/components/schemas/ChargingStation"
                  }
                }
              }
            }
          }
        },
        "500": {
          "description": "Internal Server Error"
        }
      }
    }
  },

}
