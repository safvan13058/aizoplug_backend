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
  "/app/api/chargers/location": {
    "get": {
      "summary": "Get nearby charging stations by location",
      "tags": ["Charging Stations"],
      "parameters": [
        {
          "name": "lat",
          "in": "query",
          "schema": {
            "type": "number",
            "example": 12.9716
          },
          "description": "Latitude of the user's location"
        },
        {
          "name": "long",
          "in": "query",
        
          "schema": {
            "type": "number",
            "example": 77.5946
          },
          "description": "Longitude of the user's location"
        },
        {
          "name": "radius",
          "in": "query",
       
          "schema": {
            "type": "number",
            "example": 5
          },
          "description": "Radius in kilometers to search for charging stations"
        },
        {
          "name": "search",
          "in": "query",
          "schema": {
            "type": "string",
            "example": 'aizo'
          },
          "description": "Radius in kilometers to search for charging stations"
        }
      ],
      "responses": {
        "200": {
          "description": "List of charging stations within the specified radius",
          "content": {
            "application/json": {
              "schema": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "id": { "type": "integer", "example": 1 },
                    "name": { "type": "string", "example": "Green EV Hub" },
                    "latitude": { "type": "number", "example": 12.9716 },
                    "longitude": { "type": "number", "example": 77.5946 },
                    "amenities": { "type": "string", "example": "Restroom, Cafe" },
                    "contact_info": { "type": "string", "example": "+91-9876543210" },
                    "dynamic_pricing": { "type": "boolean", "example": true },
                    "created_at": { "type": "string", "format": "date-time" },
                    "updated_at": { "type": "string", "format": "date-time" },
                    "distance": { "type": "string", "example": "1.23 Km" },
                    "connectors": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "id": { "type": "integer", "example": 101 },
                          "type": { "type": "string", "example": "Type2" },
                          "power_output": { "type": "number", "example": 22 },
                          "state": { "type": "string", "example": "connected" },
                          "status": { "type": "string", "example": "available" },
                          "ocpp_id": { "type": "string", "example": "C-1234" },
                          "last_updated": { "type": "string", "format": "date-time" },
                          "created_at": { "type": "string", "format": "date-time" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "400": {
          "description": "Missing required query parameters",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "error": {
                    "type": "string",
                    "example": "lat, long, and radius are required"
                  }
                }
              }
            }
          }
        },
        "500": {
          "description": "Internal Server Error",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "error": {
                    "type": "string",
                    "example": "Server error"
                  }
                }
              }
            }
          }
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
  "/dashboard/api/station/{station_id}/partners/{user_id}": {
    "put": {
      "summary": "Update partner details for a station",
      "tags": ["Partners"],
      "parameters": [
        {
          "name": "station_id",
          "in": "path",
          "required": true,
          "schema": {
            "type": "integer",
            "example": 1
          }
        },
        {
          "name": "user_id",
          "in": "path",
          "required": true,
          "schema": {
            "type": "integer",
            "example": 101
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
                "share_percentage": {
                  "type": "number",
                  "example": 50
                },
                "role": {
                  "type": "string",
                  "example": "partner"
                }
              }
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "Partner updated successfully",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "message": {
                    "type": "string",
                    "example": "Partner updated"
                  },
                  "data": {
                    "type": "object",
                    "properties": {
                      "station_id": {
                        "type": "integer",
                        "example": 1
                      },
                      "user_id": {
                        "type": "integer",
                        "example": 101
                      },
                      "share_percentage": {
                        "type": "number",
                        "example": 50
                      },
                      "role": {
                        "type": "string",
                        "example": "partner"
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "404": {
          "description": "Partner not found"
        },
        "500": {
          "description": "Internal Server Error"
        }
      }
    },
    "delete": {
      "summary": "Delete a partner from a station",
      "tags": ["Partners"],
      "parameters": [
        {
          "name": "station_id",
          "in": "path",
          "required": true,
          "schema": {
            "type": "integer",
            "example": 1
          }
        },
        {
          "name": "user_id",
          "in": "path",
          "required": true,
          "schema": {
            "type": "integer",
            "example": 101
          }
        }
      ],
      "responses": {
        "200": {
          "description": "Partner removed successfully",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "message": {
                    "type": "string",
                    "example": "Partner removed"
                  }
                }
              }
            }
          }
        },
        "404": {
          "description": "Partner not found"
        },
        "500": {
          "description": "Internal Server Error"
        }
      }
    }
  },
  "/dashboard/api/station/{station_id}/partners": {
    "get": {
      "summary": "List all partners for a station",
      "tags": ["Partners"],
      "parameters": [
        {
          "name": "station_id",
          "in": "path",
          "required": true,
          "schema": {
            "type": "integer",
            "example": 1
          }
        }
      ],
      "responses": {
        "200": {
          "description": "List of partners for the station",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "partners": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": "integer",
                          "example": 101
                        },
                        "name": {
                          "type": "string",
                          "example": "John Doe"
                        },
                        "email": {
                          "type": "string",
                          "example": "johndoe@example.com"
                        },
                        "share_percentage": {
                          "type": "number",
                          "example": 50
                        },
                        "role": {
                          "type": "string",
                          "example": "partner"
                        }
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
  "/dashboard/api/station/{station_id}/partners": {
    "post": {
      "summary": "Add a partner to a station",
      "tags": ["Partners"],
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "parameters": [
        {
          "name": "station_id",
          "in": "path",
          "required": true,
          "schema": {
            "type": "integer",
            "example": 1
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
                "user_id": {
                  "type": "integer",
                  "example": 101
                },
                "share_percentage": {
                  "type": "number",
                  "example": 50
                },
                "role": {
                  "type": "string",
                  "example": "partner"
                }
              },
              "required": ["user_id"]
            }
          }
        }
      },
      "responses": {
        "201": {
          "description": "Partner added successfully",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "message": {
                    "type": "string",
                    "example": "Partner added successfully"
                  },
                  "data": {
                    "type": "object",
                    "properties": {
                      "user_id": {
                        "type": "integer",
                        "example": 101
                      },
                      "station_id": {
                        "type": "integer",
                        "example": 1
                      },
                      "share_percentage": {
                        "type": "number",
                        "example": 50
                      },
                      "role": {
                        "type": "string",
                        "example": "partner"
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "400": {
          "description": "Partner already exists"
        },
        "500": {
          "description": "Internal Server Error"
        }
      }
    }
  },
  "/dashboard/api/display/{station_id}/partners": {
    "get": {
      "summary": "List partners of a specific station",
      "tags": ["Partners"],
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "parameters": [
        {
          "name": "station_id",
          "in": "path",
          "required": true,
          "schema": {
            "type": "integer",
            "example": 1
          },
          "description": "The ID of the charging station"
        }
      ],
      "responses": {
        "200": {
          "description": "List of partners for the station",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "partners": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": "integer",
                          "example": 101
                        },
                        "name": {
                          "type": "string",
                          "example": "John Doe"
                        },
                        "email": {
                          "type": "string",
                          "example": "john@example.com"
                        },
                        "share_percentage": {
                          "type": "number",
                          "example": 40.5
                        },
                        "role": {
                          "type": "string",
                          "example": "partner"
                        }
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
  "/app/api/add/wallet/": {
    "post": {
      "summary": "Create a new wallet for the user",
      "tags": ["Wallet"],
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
                "wallet_type": {
                  "type": "string",
                  "example": "general"
                },
                "currency": {
                  "type": "string",
                  "example": "INR"
                },
                "is_default": {
                  "type": "boolean",
                  "example": false
                }
              },
              "required": []
            }
          }
        },
        "responses": {
          "201": {
            "description": "Wallet created successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": {
                      "type": "string",
                      "example": "Wallet created successfully"
                    },
                    "wallet": {
                      "type": "object",
                      "properties": {
                        "user_id": {
                          "type": "integer",
                          "example": 101
                        },
                        "wallet_number": {
                          "type": "string",
                          "example": "b6f8b317-40f6-4c50-9cd2-139a43a8d634"
                        },
                        "wallet_type": {
                          "type": "string",
                          "example": "general"
                        },
                        "currency": {
                          "type": "string",
                          "example": "INR"
                        },
                        "is_default": {
                          "type": "boolean",
                          "example": false
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
    }
  },
  "/app/api/display/wallet/": {
    "get": {
      "summary": "Get all wallets for the authenticated user",
      "tags": ["Wallet"],
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "responses": {
        "200": {
          "description": "List of wallets for the user",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "user_id": {
                    "type": "integer",
                    "example": 101
                  },
                  "wallets": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "wallet_number": {
                          "type": "string",
                          "example": "b6f8b317-40f6-4c50-9cd2-139a43a8d634"
                        },
                        "wallet_type": {
                          "type": "string",
                          "example": "general"
                        },
                        "currency": {
                          "type": "string",
                          "example": "INR"
                        },
                        "balance": {
                          "type": "number",
                          "example": 1000
                        },
                        "is_default": {
                          "type": "boolean",
                          "example": false
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "404": {
          "description": "No wallets found for the user"
        },
        "500": {
          "description": "Internal Server Error"
        }
      }
    }
  },
  "/app/api/display/wallet/history": {
    "get": {
      "summary": "Get user's wallet transaction history",
      "description": "Returns a paginated list of transactions for the authenticated user, with optional date filtering.",
      "tags": ["Wallet"],
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "parameters": [
        {
          "in": "query",
          "name": "page",
          "schema": {
            "type": "integer",
            "default": 1
          },
          "description": "Page number for pagination"
        },
        {
          "in": "query",
          "name": "limit",
          "schema": {
            "type": "integer",
            "default": 10
          },
          "description": "Number of transactions per page"
        },
        {
          "in": "query",
          "name": "start_date",
          "schema": {
            "type": "string",
            "format": "date"
          },
          "description": "Filter transactions from this date (YYYY-MM-DD)"
        },
        {
          "in": "query",
          "name": "end_date",
          "schema": {
            "type": "string",
            "format": "date"
          },
          "description": "Filter transactions up to this date (YYYY-MM-DD)"
        }
      ],
      "responses": {
        "200": {
          "description": "Successful response with transaction data",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "user_id": {
                    "type": "string"
                  },
                  "page": {
                    "type": "integer"
                  },
                  "limit": {
                    "type": "integer"
                  },
                  "transactions": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": "integer"
                        },
                        "user_id": {
                          "type": "integer"
                        },
                        "amount": {
                          "type": "number",
                          "format": "float"
                        },
                        "type": {
                          "type": "string"
                        },
                        "created_at": {
                          "type": "string",
                          "format": "date-time"
                        }
                        // Add additional fields here based on your `transactions` table
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "500": {
          "description": "Server error",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "error": {
                    "type": "string"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "/app/api/topup/wallet/{walletId}": {
    "post": {
      "summary": "Top-up a wallet",
      "tags": ["Wallet"],
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "parameters": [
        {
          "name": "walletId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "example": "b6f8b317-40f6-4c50-9cd2-139a43a8d634"
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
                "amount": {
                  "type": "number",
                  "example": 1000
                }
              },
              "required": ["amount"]
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "Wallet topped up successfully",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "message": {
                    "type": "string",
                    "example": "Wallet topped up with ₹1000"
                  },
                  "transaction": {
                    "type": "object",
                    "properties": {
                      "transaction_id": {
                        "type": "integer",
                        "example": 1001
                      },
                      "amount": {
                        "type": "number",
                        "example": 1000
                      },
                      "transaction_type": {
                        "type": "string",
                        "example": "top-up"
                      },
                      "status": {
                        "type": "string",
                        "example": "completed"
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "404": {
          "description": "Wallet not found"
        },
        "500": {
          "description": "Internal Server Error"
        }
      }
    }
  },
 "/dashboard/api/add/station": {
  "post": {
    "tags": ["Charging Stations"],
    "summary": "Add a new charging station with partners",
    "security": [{ "bearerAuth": [] }],
    "requestBody": {
      "required": true,
      "content": {
        "application/json": {
          "schema": {
            "type": "object",
            "properties": {
              "name": { "type": "string" },
              "latitude": { "type": "number", "format": "float" },
              "longitude": { "type": "number", "format": "float" },
              "amenities": { "type": "string" },
              "contact_info": {
                "type": "object",
                "properties": {
                  "phone": { "type": "string", "example": "8086945415" },
                  "email": { "type": "string", "format": "email", "example": "support@example.com" }
                },
              },
              "dynamic_pricing": {
                "type": "object",
                "properties": {
                  "base_rate": {
                    "type": "number",
                    "format": "float",
                    "example": 5.00
                  }
                  // Uncomment the below to allow advanced pricing logic:
                  /*
                  "time_based": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "start": { "type": "string", "example": "06:00" },
                        "end": { "type": "string", "example": "10:00" },
                        "rate": { "type": "number", "format": "float", "example": 6.00 }
                      }
                    }
                  },
                  "peak_hours": {
                    "type": "object",
                    "properties": {
                      "enabled": { "type": "boolean", "example": true },
                      "multiplier": { "type": "number", "format": "float", "example": 1.5 }
                    }
                  }
                  */
                }
              },
              "partners": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "user_id": { "type": "integer" },
                    "role": { "type": "string", "example": "partner" },
                    "share_percentage": { "type": "number", "format": "float", "example": 50.0 }
                  },
                  "required": ["user_id"]
                }
              }
            },
            "required": ["name", "latitude", "longitude"]
          }
        }
      }
    },
    "responses": {
      "201": {
        "description": "Station and partners added successfully"
      },
      "400": {
        "description": "Invalid input"
      },
      "500": {
        "description": "Internal server error"
      }
    }
  }
},

 

  "/dashboard/api/list/station": {
    "get": {
      "tags": ["Charging Stations"],
      "summary": "List all charging stations",
      "security": [{ "bearerAuth": [] }],
      "responses": {
        "200": {
          "description": "List of stations",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "stations": {
                    "type": "array",
                    "items": { "type": "object" }
                  }
                }
              }
            }
          }
        },
        "500": { "description": "Internal server error" }
      }
    }
  },
  "/dashboard/api/delete/station/{id}": {
    "delete": {
      "tags": ["Charging Stations"],
      "summary": "Delete a charging station",
      "security": [{ "bearerAuth": [] }],
      "parameters": [
        {
          "name": "id",
          "in": "query",
          "required": true,
          "schema": { "type": "integer" }
        }
      ],
      "responses": {
        "200": { "description": "Station deleted successfully" },
        "404": { "description": "Station not found" },
        "500": { "description": "Internal server error" }
      }
    }
  },
  "/dashboard/api/list/user/station": {
    "get": {
      "tags": ["Charging Stations"],
      "summary": "List charging stations for the logged-in user",
      "security": [{ "bearerAuth": [] }],
      "responses": {
        "200": {
          "description": "List of user stations",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "stations": {
                    "type": "array",
                    "items": { "type": "object" }
                  }
                }
              }
            }
          }
        },
        "500": { "description": "Internal server error" }
      }
    }
  },
  "/charging/start": {
    "post": {
      "summary": "Start a charging session",
      "tags": ["Charging"],
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
                "vehicle_id": {
                  "type": "integer",
                  "example": 12
                },
                "ocppid": {
                  "type": "string",
                  "example": "aizochargertest"
                },
                "payment_method": {
                  "type": "string",
                  "example": "wallet"
                },
              },
              "required": ["vehicle_id", "connector_id", "payment_method"]
            }
          }
        }
      },
      "responses": {
        "201": {
          "description": "Charging session started successfully",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "message": {
                    "type": "string",
                    "example": "Charging session started successfully."
                  },
                  "session": {
                    "type": "object",
                    "properties": {
                      "id": { "type": "integer", "example": 41 },
                      "user_id": { "type": "integer", "example": 102 },
                      "vehicle_id": { "type": "integer", "example": 12 },
                      "connector_id": { "type": "integer", "example": 3 },
                      "payment_method": { "type": "string", "example": "wallet" },
                      "status": { "type": "string", "example": "ongoing" },
                      "promotion_id": { "type": "integer", "nullable": true, "example": 5 },
                      "sponsored_by": { "type": "string", "nullable": true, "example": "Tesla Inc" },
                      "sponsorship_note": { "type": "string", "nullable": true, "example": "Promotional Free Charging" },
                      "created_at": { "type": "string", "format": "date-time", "example": "2025-04-20T14:00:00Z" }
                    }
                  }
                }
              }
            }
          }
        },
        "400": {
          "description": "Bad request (e.g. insufficient balance, connector not ready)",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "error": {
                    "type": "string",
                    "example": "Insufficient wallet balance to start session."
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
  "/charging/stop": {
    "post": {
      "summary": "Stop an ongoing charging session",
      "tags": ["Charging"],
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
                "ocppid": {
                  "type": "string",
                  "example": ""
                }
              },
              "required": ["ocppid"]
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "Charging session stop command sent successfully.",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "message": {
                    "type": "string",
                    "example": "Charging session stop command sent successfully."
                  },
                  "transactionId": {
                    "type": "integer",
                    "example": 41
                  }
                }
              }
            }
          }
        },
        "400": {
          "description": "Bad request (e.g. no session or connector found)",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "error": {
                    "type": "string",
                    "example": "No ongoing session found for this connector."
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
  
    "/app/api/sessions/recent": {
      "get": {
        "tags": ["Charging Sessions"],
        "summary": "Get recent charging sessions for a user",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "status",
            "in": "query",
            "description": "Filter by session status (ongoing, completed, failed)",
            "schema": {
              "type": "string",
              "enum": ["ongoing", "completed", "failed"]
            }
          },
          {
            "name": "from",
            "in": "query",
            "description": "Start date filter (ISO 8601 format)",
            "schema": {
              "type": "string",
              "format": "date-time",
              "example": "2024-04-01T00:00:00Z"
            }
          },
          {
            "name": "to",
            "in": "query",
            "description": "End date filter (ISO 8601 format)",
            "schema": {
              "type": "string",
              "format": "date-time",
              "example": "2024-04-30T23:59:59Z"
            }
          },
          {
            "name": "limit",
            "in": "query",
            "description": "Number of sessions per page",
            "schema": {
              "type": "integer",
              "default": 30
            }
          },
          {
            "name": "page",
            "in": "query",
            "description": "Page number",
            "schema": {
              "type": "integer",
              "default": 1
            }
          }
        ],
        "responses": {
          "200": {
            "description": "List of recent charging sessions",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "page": {
                      "type": "integer"
                    },
                    "limit": {
                      "type": "integer"
                    },
                    "total_count": {
                      "type": "integer"
                    },
                    "sessions": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "id": { "type": "integer" },
                          "user_id": { "type": "integer" },
                          "vehicle_id": { "type": "integer" },
                          "connector_id": { "type": "integer" },
                          "start_time": { "type": "string", "format": "date-time" },
                          "end_time": { "type": "string", "format": "date-time", "nullable": true },
                          "updated_at": { "type": "string", "format": "date-time", "nullable": true },
                          "energy_used": { "type": "number", "format": "float" },
                          "cost": { "type": "number", "format": "float" },
                          "payment_method": {
                            "type": "string",
                            "enum": ["wallet", "RFID", "QR"]
                          },
                          "status": {
                            "type": "string",
                            "enum": ["ongoing", "completed", "failed"]
                          },
                          "created_at": { "type": "string", "format": "date-time" },
                          "promotion_id": { "type": "integer", "nullable": true },
                          "discount_amount": { "type": "number", "format": "float" },
                          "sponsored_by": { "type": "integer", "nullable": true },
                          "sponsorship_note": { "type": "string", "nullable": true }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "Bad request"
          },
          "401": {
            "description": "Unauthorized"
          },
          "500": {
            "description": "Internal server error"
          }
        }
      }
    },  
    "/dashboard/api/stations/{station_id}/connectors": {
      "post": {
        "tags": ["Connectors"],
        "summary": "Add a new connector to a station",
        "description": "Adds a connector for a given station. Requires admin, staff, or dealer roles.",
        "operationId": "addConnector",
        "parameters": [
          {
            "name": "station_id",
            "in": "path",
            "required": true,
            "description": "ID of the station to which the connector will be added",
            "schema": {
              "type": "string"
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
                  "type": {
                    "type": "string",
                    "example": "Type2"
                  },
                  "power_output": {
                    "type": "number",
                    "example": 22.5
                  },
                  "state": {
                    "type": "string",
                    "example": "available"
                  },
                  "status": {
                    "type": "string",
                    "example": "active"
                  },
                  "ocpp_id": {
                    "type": "string",
                    "example": "connector-001"
                  },
                  "last_updated": {
                    "type": "string",
                    "format": "date-time",
                    "example": "2025-04-23T10:00:00Z"
                  }
                },
                "required": ["ocpp_id"]
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Connector added successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": {
                      "type": "string",
                      "example": "Connector added successfully"
                    },
                    "connector": {
                      "type": "object",
                      "example": {
                        "id": 1,
                        "station_id": "123",
                        "type": "Type2",
                        "power_output": 22.5,
                        "state": "available",
                        "status": "active",
                        "ocpp_id": "connector-001",
                        "last_updated": "2025-04-23T10:00:00Z"
                      }
                    }
                  }
                }
              }
            }
          },
          "500": {
            "description": "Internal Server Error",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "error": {
                      "type": "string",
                      "example": "Internal Server Error"
                    }
                  }
                }
              }
            }
          }
        },
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/dashboard/api/connectors/{id}": {
    "delete": {
      "tags": ["Connectors"],
      "summary": "Delete a connector",
      "description": "Deletes a connector by ID. Requires admin, staff, or dealer roles.",
      "operationId": "deleteConnector",
      "parameters": [
        {
          "name": "id",
          "in": "path",
          "required": true,
          "description": "ID of the connector to delete",
          "schema": {
            "type": "integer"
          }
        }
      ],
      "responses": {
        "200": {
          "description": "Connector deleted successfully",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "message": {
                    "type": "string",
                    "example": "Connector deleted successfully"
                  },
                  "connector": {
                    "type": "object",
                    "example": {
                      "id": 1,
                      "station_id": 10,
                      "type": "CCS",
                      "power_output": 50.0,
                      "state": "connected",
                      "status": "Available",
                      "ocpp_id": "aizochargertest",
                      "last_updated": "2025-04-23T10:00:00Z",
                      "created_at": "2025-04-22T08:30:00Z"
                    }
                  }
                }
              }
            }
          }
        },
        "404": {
          "description": "Connector not found",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "error": {
                    "type": "string",
                    "example": "Connector not found"
                  }
                }
              }
            }
          }
        },
        "500": {
          "description": "Internal Server Error"
        }
      },
      "security": [
        {
          "bearerAuth": []
        }
      ]
    }
  },
  "/app/api/device/accessshare/{station_id}": {
      "post": {
        "tags": ["Access Share"],
        "summary": "Share device access by linking to a station",
        "description": "Links devices associated with a 'thing' to a charging station as either connectors or plug switches. Fails if any device is already linked.",
        "operationId": "shareDeviceAccess",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "station_id",
            "in": "path",
            "description": "ID of the charging station to link devices to",
            "required": true,
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
                  "serial": {
                    "type": "string",
                    "example": "ABC123XYZ"
                  },
                  "securitykey": {
                    "type": "string",
                    "example": "secureKey987"
                  }
                },
                "required": ["serial", "securitykey"]
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Devices successfully linked",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": {
                      "type": "string",
                      "example": "Devices successfully linked"
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "Device already connected",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": {
                      "type": "string",
                      "example": "Device already connected"
                    }
                  }
                }
              }
            }
          },
          "404": {
            "description": "Thing not found or no devices found",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": {
                      "type": "string",
                      "example": "Thing not found or invalid credentials"
                    }
                  }
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": {
                      "type": "string",
                      "example": "Internal server error"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/app/api/station/devices/{station_id}": {
      "get": {
        "tags": ["Station Devices"],
        "summary": "Get connectors and/or plug switches for a station",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "station_id",
            "in": "path",
            "required": true,
            "description": "ID of the station",
            "schema": {
              "type": "integer"
            }
          },
          {
            "name": "type",
            "in": "query",
            "required": false,
            "description": "Device type: 'charger' for connectors, 'switch' for plug switches. Leave empty to fetch both.",
            "schema": {
              "type": "string",
              "enum": ["charger", "switch"]
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "chargers": {
                      "type": "array",
                      "items": {
                        // "$ref": "#/components/schemas/Connector"
                      }
                    },
                    "switches": {
                      "type": "array",
                      "items": {
                        // "$ref": "#/components/schemas/PlugSwitch"
                      }
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "Bad Request"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/app/api/connector/qr/{ocppid}": {
    "get": {
      "summary": "Get connector and station info by OCPP ID",
      "description": "Returns details of a connector and its associated charging station using the connector's OCPP ID.",
      "tags": ["Connectors"],
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "parameters": [
        {
          "name": "ocppid",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string"
          },
          "description": "The OCPP ID of the connector"
        }
      ],
      "responses": {
        "200": {
          "description": "Connector and station found",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "connector": {
                    "type": "object",
                    "properties": {
                      "id": { "type": "integer" },
                      "type": { "type": "string" },
                      "power_output": { "type": "number", "format": "float" },
                      "state": { "type": "string" },
                      "status": { "type": "string" },
                      "ocpp_id": { "type": "string" },
                      "last_updated": { "type": "string", "format": "date-time" },
                      "created_at": { "type": "string", "format": "date-time" }
                    }
                  },
                  "station": {
                    "type": "object",
                    "properties": {
                      "id": { "type": "integer" },
                      "name": { "type": "string" },
                      "latitude": { "type": "number", "format": "float" },
                      "longitude": { "type": "number", "format": "float" },
                      "amenities": { "type": "string" },
                      "contact_info": { "type": "string" },
                      "dynamic_pricing": { "type": "object" },
                      "created_at": { "type": "string", "format": "date-time" },
                      "updated_at": { "type": "string", "format": "date-time" }
                    }
                  }
                }
              }
            }
          }
        },
        "404": {
          "description": "No connector found with the given OCPP ID",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "message": { "type": "string" }
                }
              }
            }
          }
        },
        "500": {
          "description": "Internal server error",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "error": { "type": "string" }
                }
              }
            }
          }
        }
      }
    }
  },
  "/dashborad/api/update/station/{id}": {
    "patch": {
      "summary": "Update an existing charging station",
      "description": "Dynamically updates one or more fields of a charging station.",
      "tags": ["Charging Stations"],
      "parameters": [
        {
          "name": "id",
          "in": "path",
          "required": true,
          "description": "ID of the charging station to update",
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
              "description": "Fields to update. At least one is required.",
              "properties": {
                "name": {
                  "type": "string",
                  "example": "EV Plaza Updated"
                },
                "latitude": {
                  "type": "number",
                  "format": "float",
                  "example": 37.7749295
                },
                "longitude": {
                  "type": "number",
                  "format": "float",
                  "example": -122.4194155
                },
                "amenities": {
                  "type": "string",
                  "example": "wifi,parking,restroom"
                },
                "contact_info": {
                  "type": "string",
                  "example": "support@evplaza.com"
                },
                "dynamic_pricing": {
                  "type": "object",
                  "example": {
                    "rate_per_kW": 0.25
                  }
                }
              },
              "additionalProperties": true
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "Charging station updated successfully",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "message": {
                    "type": "string",
                    "example": "Charging station updated successfully"
                  },
                  "station": {
                    "$ref": "#/components/schemas/ChargingStation"
                  }
                }
              }
            }
          }
        },
        "400": {
          "description": "No fields provided to update",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "error": {
                    "type": "string",
                    "example": "No fields provided to update"
                  }
                }
              }
            }
          }
        },
        "404": {
          "description": "Station not found",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "error": {
                    "type": "string",
                    "example": "Station not found"
                  }
                }
              }
            }
          }
        },
        "500": {
          "description": "Internal server error",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "error": {
                    "type": "string",
                    "example": "Internal Server Error"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
    "/app/api/session/billing/{session_id}": {
      "get": {
        "summary": "Get billing details for a charging session",
        "tags": ["Sessions Billing"],
        "parameters": [
          {
            "in": "path",
            "name": "session_id",
            "required": true,
            "schema": {
              "type": "integer"
            },
            "description": "Unique ID of the charging session"
          }
        ],
        "responses": {
          "200": {
            "description": "Billing session details",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "session_id": {
                      "type": "integer",
                      "example": 12
                    },
                    "user_name": {
                      "type": "string",
                      "example": "Alice"
                    },
                    "vehicle_number": {
                      "type": "string",
                      "example": "XYZ1234"
                    },
                    "start_time": {
                      "type": "string",
                      "format": "date-time",
                      "example": "2025-04-28T10:00:00Z"
                    },
                    "end_time": {
                      "type": "string",
                      "format": "date-time",
                      "example": "2025-04-28T11:00:00Z"
                    },
                    "energy_used": {
                      "type": "number",
                      "format": "float",
                      "example": 5.2
                    },
                    "power": {
                      "type": "number",
                      "format": "float",
                      "example": 3.1
                    },
                    "ampere": {
                      "type": "number",
                      "format": "float",
                      "example": 16
                    },
                    "voltage": {
                      "type": "number",
                      "format": "float",
                      "example": 220
                    },
                    "cost": {
                      "type": "number",
                      "format": "float",
                      "example": 120.00
                    },
                    "payment_method": {
                      "type": "string",
                      "enum": ["wallet", "RFID", "QR"],
                      "example": "wallet"
                    },
                    "status": {
                      "type": "string",
                      "enum": ["ongoing", "completed", "failed"],
                      "example": "completed"
                    },
                    "transaction": {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": "integer",
                          "example": 22
                        },
                        "amount": {
                          "type": "number",
                          "format": "float",
                          "example": 120.00
                        },
                        "type": {
                          "type": "string",
                          "example": "debit"
                        },
                        "status": {
                          "type": "string",
                          "example": "completed"
                        }
                      }
                    },
                    "connector": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "id": {
                            "type": "integer",
                            "example": 5
                          },
                          "ocppid": {
                            "type": "string",
                            "example": "OCPP123"
                          },
                          "type": {
                            "type": "string",
                            "example": "Type2"
                          },
                          "deviceid": {
                            "type": "string",
                            "example": "ESP8266-ABC123"
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "404": {
            "description": "Session not found"
          },
          "500": {
            "description": "Internal server error"
          }
        }
      }
    },
    "/app/api/set/selected/vehicles/{vehicle_id}": {
      "post": {
        "tags": ["Vehicles"],
        "summary": "Set selected vehicle for a user",
        "description": "Sets the selected vehicle for the authenticated user. Only one vehicle per user can be marked as currently selected.",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "vehicle_id",
            "in": "path",
            "description": "ID of the vehicle to be set as selected",
            "required": true,
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Vehicle selected successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": {
                      "type": "string",
                      "example": "Vehicle selected successfully"
                    },
                    "vehicle": {
                      "$ref": "#/components/schemas/Vehicle"
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "Bad Request",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "error": {
                      "type": "string",
                      "example": "user_id and vehicle_id are required"
                    }
                  }
                }
              }
            }
          },
          "404": {
            "description": "Vehicle not found or does not belong to the user",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "error": {
                      "type": "string",
                      "example": "Vehicle not found or does not belong to the user"
                    }
                  }
                }
              }
            }
          },
          "500": {
            "description": "Server error",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "error": {
                      "type": "string",
                      "example": "Server error"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/dashboard/api/user/add/station": {
      "post": {
        "summary": "Add a new charging station",
        "tags": ["Charging Stations"],
        "security": [
          { "bearerAuth": [] }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "name": { "type": "string" },
                  "latitude": { "type": "number" },
                  "longitude": { "type": "number" },
                  "amenities": { "type": "string" },
                  "contact_info": { "type": "string" },
                  "dynamic_pricing": { "type": "boolean" }
                },
                "required": ["name", "latitude", "longitude", "contact_info"]
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Charging station created successfully with user as partner",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": { "type": "string" },
                    "station": { "type": "object" }
                  }
                }
              }
            }
          },
          "400": {
            "description": "Bad request - user_id missing"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/dashboard/api/enable/toggle/{station_id}": {
      "patch": {
        "summary": "Toggle enable/disable status of a station",
        "tags": ["Charging Stations"],
        "security": [
          { "bearerAuth": [] }
        ],
        "parameters": [
          {
            "name": "station_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "ID of the charging station"
          }
        ],
        "responses": {
          "200": {
            "description": "Station status toggled successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": { "type": "string" },
                    "station": { "type": "object" }
                  }
                }
              }
            }
          },
          "400": {
            "description": "Bad request - Station ID missing"
          },
          "404": {
            "description": "Station not found"
          },
          "500": {
            "description": "Internal Server Error"
          }
        }
      }
    },
    "/app/api/toggle/switch": {
      "post": {
        "summary": "Toggle power state of a smart switch",
        "tags": ["Switch Control"],
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
                  "deviceid": {
                    "type": "string",
                    "example": "Thing123_1",
                    "description": "Format must be <thingName>_<switchNumber>"
                  },
                  "state": {
                    "type": "string",
                    "enum": ["on", "off"]
                  },
                  "voltage": {
                    "type": "number",
                    "default": 100
                  },
                  "payment_method": {
                    "type": "string",
                    "nullable": true
                  },
                  "promotion_id": {
                    "type": "string",
                    "nullable": true
                  },
                  "sponsored_by": {
                    "type": "string",
                    "nullable": true
                  },
                  "sponsorship_note": {
                    "type": "string",
                    "nullable": true
                  }
                },
                "required": ["deviceid", "state"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Switch toggled successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": {
                      "type": "string"
                    },
                    "session": {
                      "type": "object",
                      "nullable": true
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "Invalid request payload",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "error": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "error": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/dashboard/api/connectors/{id}": {
      "delete": {
        "summary": "Delete a connector by ID",
        "tags": ["Access Share"],
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID of the connector to delete",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Connector deleted successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": {
                      "type": "string",
                      "example": "Connector deleted successfully"
                    },
                    "connector": {
                      "type": "object",
                      "description": "Details of the deleted connector"
                    }
                  }
                }
              }
            }
          },
          "404": {
            "description": "Connector not found",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "error": {
                      "type": "string",
                      "example": "Connector not found"
                    }
                  }
                }
              }
            }
          },
          "500": {
            "description": "Internal Server Error",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "error": {
                      "type": "string",
                      "example": "Internal Server Error"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/dashboard/api/switch/remove/{deviceId}": {
      "delete": {
        "summary": "Delete all plug switches linked to a device's thingId",
        "description": "Deletes all plug_switches associated with any device under the same thing as the provided deviceId. Devices themselves are not deleted.",
        "tags": ["Access Share"],
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "deviceId",
            "in": "path",
            "description": "The deviceId used to find related devices via thingId",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Plug switches successfully deleted for all devices under the same thing",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": {
                      "type": "string",
                      "example": "Plug switches for all devices under the thing deleted successfully"
                    },
                    "deleted": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "description": "Details of each deleted plug switch"
                      }
                    }
                  }
                }
              }
            }
          },
          "404": {
            "description": "Device or plug switches not found",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "error": {
                      "type": "string",
                      "example": "Device not found"
                    },
                    "message": {
                      "type": "string",
                      "example": "No plug switches found for devices of this thing"
                    }
                  }
                }
              }
            }
          },
          "500": {
            "description": "Internal Server Error",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "error": {
                      "type": "string",
                      "example": "Internal Server Error"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
     "/payment/create-order": {
      "post": {
        "summary": "Create Razorpay Order",
        "tags": ["Payment Integration"],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "amount": {
                    "type": "number",
                    "example": 500
                  }
                },
                "required": ["amount"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Order created successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "id": { "type": "string" },
                    "amount": { "type": "number" },
                    "currency": { "type": "string" },
                    "receipt": { "type": "string" },
                    "status": { "type": "string" }
                  }
                }
              }
            }
          },
          "500": {
            "description": "Server error"
          }
        }
      }
    },
    "/payment/verify": {
      "post": {
        "summary": "Verify Razorpay Payment Signature",
        "tags": ["Payment Integration"],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "razorpay_order_id": {
                    "type": "string",
                    "example": "order_KlG5X2DFvJr82a"
                  },
                  "razorpay_payment_id": {
                    "type": "string",
                    "example": "pay_KlG6Iv3KzU8xEv"
                  },
                  "razorpay_signature": {
                    "type": "string",
                    "example": "f58a34a7c2c826089d3d1324e872059cc1702f85c21c23bd42b53fbb7c97c0a0"
                  }
                },
                "required": ["razorpay_order_id", "razorpay_payment_id", "razorpay_signature"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Payment verified successfully"
          },
          "400": {
            "description": "Invalid signature"
          }
        }
      }
    },

    "/app/api/toggle/fav/{station_id}": {
      "post": {
        "tags": ["Favorites"],
        "summary": "Toggle favorite status of a charging station",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "station_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer"
            },
            "description": "ID of the charging station"
          }
        ],
        "responses": {
          "200": {
            "description": "Favorite status toggled successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": {
                      "type": "string"
                    },
                    "is_favorite": {
                      "type": "boolean"
                    }
                  }
                }
              }
            }
          },
          "500": {
            "description": "Internal server error"
          }
        }
      }
    },
    "/app/api/fav/stations": {
      "get": {
        "tags": ["Favorites"],
        "summary": "Get all favorited charging stations for the logged-in user",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "page",
            "in": "query",
            "schema": {
              "type": "integer",
              "default": 1
            },
            "description": "Page number for pagination"
          },
          {
            "name": "limit",
            "in": "query",
            "schema": {
              "type": "integer",
              "default": 10
            },
            "description": "Number of records per page"
          }
        ],
        "responses": {
          "200": {
            "description": "List of favorited charging stations",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "page": {
                      "type": "integer"
                    },
                    "limit": {
                      "type": "integer"
                    },
                    "total": {
                      "type": "integer"
                    },
                    "totalPages": {
                      "type": "integer"
                    },
                    "favorites": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "id": { "type": "integer" },
                          "name": { "type": "string" },
                          "location": { "type": "string" },
                          "is_favorite": { "type": "boolean" }
                          // Add more fields depending on your charging_stations schema
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "500": {
            "description": "Internal server error"
          }
        }
      }
    },

     "/dashboard/api/stations/upload/images/{stationId}": {
      "post": {
        "tags": ["Charging Stations"],
        "summary": "Upload images for a charging station",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "stationId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer"
            },
            "description": "ID of the charging station"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "multipart/form-data": {
              "schema": {
                "type": "object",
                "properties": {
                  "primary_index": {
                    "type": "integer",
                    "description": "Index of the image to be set as primary (e.g., 0 for the first image)"
                  },
                  "files": {
                    "type": "array",
                    "items": {
                      "type": "string",
                      "format": "binary"
                    },
                    "description": "The image files to be uploaded"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Images uploaded successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": {
                      "type": "string",
                      "example": "Images uploaded successfully"
                    },
                    "images": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "url": {
                            "type": "string",
                            "description": "URL of the uploaded image"
                          },
                          "is_primary": {
                            "type": "boolean",
                            "description": "Indicates if the image is primary"
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "No images uploaded or bad request"
          },
          "500": {
            "description": "Internal server error"
          }
        }
      }
    },
     "/dashboard/api/stations/images/{stationId}": {
      "get": {
        "tags": ["Charging Stations"],
        "summary": "Get all images for a charging station",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "stationId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer"
            },
            "description": "ID of the charging station"
          }
        ],
        "responses": {
          "200": {
            "description": "List of images for the charging station",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "images": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "id": {
                            "type": "integer"
                          },
                          "station_id": {
                            "type": "integer"
                          },
                          "image_url": {
                            "type": "string",
                            "description": "URL of the image"
                          },
                          "is_primary": {
                            "type": "boolean",
                            "description": "Indicates if this image is the primary image"
                          },
                          "uploaded_at": {
                            "type": "string",
                            "format": "date-time",
                            "description": "Timestamp when the image was uploaded"
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "404": {
            "description": "No images found for the station"
          },
          "500": {
            "description": "Internal server error"
          }
        }
      }
    },
    "/dashboard/api/stations/images/{stationId}/{imageId}": {
      "delete": {
        "tags": ["Charging Stations"],
        "summary": "Delete an image for a charging station",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "stationId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer"
            },
            "description": "ID of the charging station"
          },
          {
            "name": "imageId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer"
            },
            "description": "ID of the image to delete"
          }
        ],
        "responses": {
          "200": {
            "description": "Image deleted successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": {
                      "type": "string",
                      "example": "Image deleted successfully"
                    }
                  }
                }
              }
            }
          },
          "404": {
            "description": "Image not found"
          },
          "500": {
            "description": "Internal server error"
          }
        }
      }
    },
    "/dashboard/api/stations/images/{stationId}/{imageId}/primary": {
      "put": {
        "tags": ["Charging Stations"],
        "summary": "Set an image as primary for a station",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "stationId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer"
            },
            "description": "ID of the charging station"
          },
          {
            "name": "imageId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer"
            },
            "description": "ID of the image to set as primary"
          }
        ],
        "responses": {
          "200": {
            "description": "Image set as primary successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": {
                      "type": "string",
                      "example": "Image set as primary successfully"
                    },
                    "image": {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": "integer"
                        },
                        "station_id": {
                          "type": "integer"
                        },
                        "image_url": {
                          "type": "string"
                        },
                        "is_primary": {
                          "type": "boolean"
                        },
                        "uploaded_at": {
                          "type": "string",
                          "format": "date-time"
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "404": {
            "description": "Image not found or invalid for this station"
          },
          "500": {
            "description": "Internal server error"
          }
        }
      }
    },
};

module.exports = Swaggerdoc;
