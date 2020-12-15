var Cheese = require("./cheese.model");

module.exports = (app) => {
    // Create a cheese
    app.post("/api/v1/cheeses", (request, response, next) => {
        try {
            var result = new Cheese({
                name: request.fields.name,
                price: request.fields.price,
                weight: request.fields.weight,
                strength: request.fields.strength,
                brand: request.fields.brand,
            });
            result.save();

            response.status(201);
            response.json(result);
        } catch (error) {
            return next(error);
        }
    });

    // Get all cheeses
    app.get("/api/v1/cheeses", async (request, response, next) => {
        try {
            var page = 1;
            var result = await Cheese.find();

            var restful = {
                count: result.length,
                next: `${request.protocol}://${request.hostname}${request.hostname == "localhost" ? ":" + process.env.PORT : ""}${request.url}?page=${page}`,
                previous: null,
                url: `${request.protocol}://${request.hostname}${request.hostname == "localhost" ? ":" + process.env.PORT : ""}${request.url}`,
                results: result
            }

            response.json(restful);
        } catch (error) {
            return next(error);
        }
    });

    // Get single cheese by id
    app.get("/api/v1/cheeses/:id", async (request, response, next) => {
        try {
            var result = await Cheese.findById(request.params.id);
            if (!result) {
                response.status(404);
                response.end();
                return;
            }
            response.json(result);
        } catch (error) {
            return next(error);
        }
    });

    // Update a cheese
    app.patch("/api/v1/cheeses/:id", async (request, response, next) => {
        try {
            var {name, price, weight, strength, brand} = request.fields;
            var updateObj = {};

            if (name) updateObj.name = name;
            if (price) updateObj.price = price;
            if (weight) updateObj.weight = weight;
            if (strength) updateObj.strength = strength;
            if (brand) updateObj.brand = brand;

            await Cheese.findByIdAndUpdate(request.params.id, updateObj);
            var result = await Cheese.findById(request.params.id);

            response.status(200);
            response.json(result);
        } catch (error) {
            return next(error);
        }
    });

    // Delete a cheese
    app.delete("/api/v1/cheeses/:id", async (request, response, next) => {
        try {
            await Cheese.findByIdAndRemove(request.params.id);

            response.status(204);
            response.end();
        } catch (error) {
            return next(error);
        }
    });
}