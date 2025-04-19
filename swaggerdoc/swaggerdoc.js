const Swaggerdoc = {
  "/dashboard/api/add/station": {
    post: {
      summary: "Add a new charging station",
      tags: ["Charging Stations"],
      security: [
        {
          bearerAuth: []
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string", example: "Downtown EV Hub" },
                latitude: { type: "number", example: 37.7749 },
                longitude: { type: "number", example: -122.4194 },
                amenities: { type: "string", example: "WiFi, Restrooms, Coffee" },
                contact_info: { type: "string", example: "123-456-7890" },
                dynamic_pricing: { type: "boolean", example: true }
              },
              required: [
                "name",
                "latitude",
                "longitude",
                "contact_info",
                "dynamic_pricing"
              ]
            }
          }
        }
      },
      responses: {
        201: {
          description: "Charging station created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Charging station created successfully"
                  },
                  station: {
                    // $ref: "#/components/schemas/ChargingStation"
                  }
                }
              }
            }
          }
        },
        500: {
          description: "Internal Server Error"
        }
      }
    }
  },
  "/app/api/add/vehicles/": {
      "post": {
        "summary": "Create a new vehicle",
        "tags": ["Vehicles"],
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
                  "vehicle_number": {
                    "type": "string",
                    "example": "ABC123"
                  },
                  "vin_number": {
                    "type": "string",
                    "example": "1HGCM82633A123456"
                  },
                  "wheel_type": {
                    "type": "string",
                    "example": "All-Wheel Drive"
                  },
                  "make": {
                    "type": "string",
                    "example": "Tesla"
                  },
                  "model": {
                    "type": "string",
                    "example": "Model 3"
                  },
                  "auto_charging_enabled": {
                    "type": "boolean",
                    "example": true
                  }
                },
                "required": [
                  "vehicle_number",
                  "vin_number",
                  "make",
                  "model"
                ]
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Vehicle created successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": {
                      "type": "string",
                      "example": "Vehicle created successfully"
                    },
                    "vehicle": {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": "integer",
                          "example": 1
                        },
                        "vehicle_number": {
                          "type": "string",
                          "example": "ABC123"
                        },
                        "vin_number": {
                          "type": "string",
                          "example": "1HGCM82633A123456"
                        },
                        "make": {
                          "type": "string",
                          "example": "Tesla"
                        },
                        "model": {
                          "type": "string",
                          "example": "Model 3"
                        },
                        "auto_charging_enabled": {
                          "type": "boolean",
                          "example": true
                        }
                      }
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
    "/app/api/update/vehicles/{id}": {
      "put": {
        "summary": "Update an existing vehicle",
        "tags": ["Vehicles"],
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "description": "Vehicle ID to update",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "vehicle_number": {
                    "type": "string",
                    "example": "ABC123"
                  },
                  "vin_number": {
                    "type": "string",
                    "example": "1HGCM82633A123456"
                  },
                  "wheel_type": {
                    "type": "string",
                    "example": "All-Wheel Drive"
                  },
                  "make": {
                    "type": "string",
                    "example": "Tesla"
                  },
                  "model": {
                    "type": "string",
                    "example": "Model 3"
                  },
                  "auto_charging_enabled": {
                    "type": "boolean",
                    "example": true
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Vehicle updated successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": {
                      "type": "string",
                      "example": "Vehicle updated successfully"
                    },
                    "vehicle": {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": "integer",
                          "example": 1
                        },
                        "vehicle_number": {
                          "type": "string",
                          "example": "ABC123"
                        },
                        "vin_number": {
                          "type": "string",
                          "example": "1HGCM82633A123456"
                        },
                        "make": {
                          "type": "string",
                          "example": "Tesla"
                        },
                        "model": {
                          "type": "string",
                          "example": "Model 3"
                        },
                        "auto_charging_enabled": {
                          "type": "boolean",
                          "example": true
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "No fields to update"
          },
          "404": {
            "description": "Vehicle not found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/app/api/delete/vehicles/{id}": {
      "delete": {
        "summary": "Delete an existing vehicle",
        "tags": ["Vehicles"],
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "description": "Vehicle ID to delete",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Vehicle deleted successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": {
                      "type": "string",
                      "example": "Vehicle deleted successfully"
                    },
                    "vehicle": {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": "integer",
                          "example": 1
                        },
                        "vehicle_number": {
                          "type": "string",
                          "example": "ABC123"
                        },
                        "vin_number": {
                          "type": "string",
                          "example": "1HGCM82633A123456"
                        },
                        "make": {
                          "type": "string",
                          "example": "Tesla"
                        },
                        "model": {
                          "type": "string",
                          "example": "Model 3"
                        },
                        "auto_charging_enabled": {
                          "type": "boolean",
                          "example": true
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "404": {
            "description": "Vehicle not found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/app/api/vehicles/{id}/toggle-auto": {
      "patch": {
        "summary": "Toggle auto charging enabled for a vehicle",
        "tags": ["Vehicles"],
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "description": "Vehicle ID to toggle auto charging",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Auto charging status toggled successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": {
                      "type": "string",
                      "example": "Auto charging has been turned ON"
                    },
                    "auto_charging": {
                      "type": "string",
                      "example": "turned ON"
                    },
                    "vehicle": {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": "integer",
                          "example": 1
                        },
                        "vehicle_number": {
                          "type": "string",
                          "example": "ABC123"
                        },
                        "vin_number": {
                          "type": "string",
                          "example": "1HGCM82633A123456"
                        },
                        "make": {
                          "type": "string",
                          "example": "Tesla"
                        },
                        "model": {
                          "type": "string",
                          "example": "Model 3"
                        },
                        "auto_charging_enabled": {
                          "type": "boolean",
                          "example": true
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "404": {
            "description": "Vehicle not found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/app/api/display/user/vehicles": {
      "get": {
        "summary": "Get all vehicles for a specific user",
        "tags": ["Vehicles"],
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "responses": {
          "200": {
            "description": "List of vehicles for the user",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "integer",
                        "example": 1
                      },
                      "vehicle_number": {
                        "type": "string",
                        "example": "ABC123"
                      },
                      "vin_number": {
                        "type": "string",
                        "example": "1HGCM82633A123456"
                      },
                      "wheel_type": {
                        "type": "string",
                        "example": "Alloy"
                      },
                      "make": {
                        "type": "string",
                        "example": "Tesla"
                      },
                      "model": {
                        "type": "string",
                        "example": "Model 3"
                      },
                      "auto_charging_enabled": {
                        "type": "boolean",
                        "example": true
                      },
                      "created_at": {
                        "type": "string",
                        "format": "date-time",
                        "example": "2025-04-19T12:34:56Z"
                      }
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
};

module.exports = Swaggerdoc;
