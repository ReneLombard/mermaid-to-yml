classDiagram
    namespace VehicleManagement.Assistance {
        class ServiceInterface {
            <<Interface>>
            +void executeService()
        }
        class MaintenanceService {
            <<Class>>
            +void executeService()
        }
        class InsurancePolicy {
            <<Class>>
            +String policyId
            +void coverVehicle(Car car)
        }
        }
    namespace VehicleManagement.Dealership {
        class PaintColor {
            <<enumeration>>
            RED
            BLUE
            GREEN
            WHITE
            BLACK
        }
        class Vehicle {
            <<Class>>
            +String brand
            +String model
            +void startEngine()$
        }
        class Car {
            <<Class>>
            +int doorCount
            +void accelerate()$
            #void scheduleMaintenance()* 
            -String engineType
            +PaintColor bodyColor
        }
        class Engine {
            <<Class>>
            +int horsepower
            +void start()
        }
        class Tire {
            <<Class>>
            +int diameterd
            +void rotate()
        }
        class Garage {
            <<Class>>
            +String address
            +void storeVehicle(Car car)
        }
        class Driver {
            <<Class>>
            +String fullName
            +void driveVehicle(Car car)
        }
        class Fuel {
            <<Class>>
            +String fuelType
            +void refuel()
        }
        }
        Vehicle <|-- Car : SportsModel
        Car --* Engine : TurboV8
        Car --o Tire : AlloyRims
        Driver "1"-->"*" Car : Ownership
        Driver -- Garage : ParkingLocation
        Car ..> Fuel : PremiumFuel
        MaintenanceService ..|> ServiceInterface : ServiceDetails
        InsurancePolicy .. Driver : CoverageDetail