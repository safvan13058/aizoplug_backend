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
        "summary": "Get transaction history for the authenticated user",
        "tags": ["Wallet"],
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "responses": {
          "200": {
            "description": "Transaction history for the user",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "user_id": {
                      "type": "integer",
                      "example": 101
                    },
                    "transactions": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "transaction_id": {
                            "type": "integer",
                            "example": 1001
                          },
                          "amount": {
                            "type": "number",
                            "example": 500
                          },
                          "transaction_type": {
                            "type": "string",
                            "example": "top-up"
                          },
                          "status": {
                            "type": "string",
                            "example": "completed"
                          },
                          "created_at": {
                            "type": "string",
                            "example": "2025-04-19T14:30:00Z"
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
};

module.exports = Swaggerdoc;
