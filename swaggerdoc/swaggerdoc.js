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
          "required": true,
          "schema": {
            "type": "number",
            "example": 12.9716
          },
          "description": "Latitude of the user's location"
        },
        {
          "name": "long",
          "in": "query",
          "required": true,
          "schema": {
            "type": "number",
            "example": 77.5946
          },
          "description": "Longitude of the user's location"
        },
        {
          "name": "radius",
          "in": "query",
          "required": true,
          "schema": {
            "type": "number",
            "example": 5
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
                "contact_info": { "type": "string" },
                "dynamic_pricing": {
                  "type": "object",
                  "properties": {
                    "base_rate": {
                      "type": "number",
                      "format": "float",
                      "example": 5.00
                    },
                    // "time_based": {
                    //   "type": "array",
                    //   "items": {
                    //     "type": "object",
                    //     "properties": {
                    //       "start": { "type": "string", "example": "06:00" },
                    //       "end": { "type": "string", "example": "10:00" },
                    //       "rate": { "type": "number", "format": "float", "example": 6.00 }
                    //     }
                    //   }
                    // },
                    // "peak_hours": {
                    //   "type": "object",
                    //   "properties": {
                    //     "enabled": { "type": "boolean", "example": true },
                    //     "multiplier": { "type": "number", "format": "float", "example": 1.5 }
                    //   }
                    // }
                  }
                }
                ,
                "partners": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "user_id": { "type": "integer" },
                      "role": { "type": "string" },
                      "share_percentage": { "type": "number", "format": "float" }
                    },
                    "required": ["user_id"]
                  }
                }
              },
              "required": ["name", "latitude", "longitude", "partners"]
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
  "/dashboard/api/update/station": {
    "put": {
      "tags": ["Charging Stations"],
      "summary": "Update a charging station",
      "security": [{ "bearerAuth": [] }],
      "parameters": [
        {
          "name": "id",
          "in": "query",
          "required": true,
          "schema": { "type": "integer" }
        }
      ],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "description": "Fields to update"
            }
          }
        }
      },
      "responses": {
        "200": { "description": "Station updated successfully" },
        "400": { "description": "No fields provided" },
        "404": { "description": "Station not found" },
        "500": { "description": "Internal server error" }
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
  "/dashboard/api/delete/station": {
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
                "estimated_cost": {
                  "type": "number",
                  "example": 150.00
                },
                "promotion_id": {
                  "type": "integer",
                  "nullable": true,
                  "example": 5
                },
                "sponsored_by": {
                  "type": "string",
                  "nullable": true,
                  "example": "Tesla Inc"
                },
                "sponsorship_note": {
                  "type": "string",
                  "nullable": true,
                  "example": "Promotional Free Charging"
                }
              },
              "required": ["vehicle_id", "connector_id", "payment_method", "estimated_cost"]
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
                "connector_id": {
                  "type": "integer",
                  "example": 3
                }
              },
              "required": ["connector_id"]
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
};

module.exports = Swaggerdoc;
