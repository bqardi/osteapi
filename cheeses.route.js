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
        var limit = parseInt(request.query.limit) || 5;
        var page = parseInt(request.query.page) - 1 || 0; // Hvis der skrives ?page=1 i url vil page (variablen) være 0, hvis ?page=3, er page 2, osv.
        var offset = page * limit;
        var displayedPage = page + 1;
        try {
            var count = (await Cheese.find()).length;
            
            // Hvis der skrives et "page" nummer der er "udenfor range" f.eks. page=0 eller page=4 (afhængig af limit)
            if (page < 0 || offset > count) {
                response.status(404);
                response.end();
                return;
            }

            var results = await Cheese.find().limit(limit).skip(offset);

            var baseUrl = `${request.protocol}://${request.hostname}${request.hostname == "localhost" ? ":" + process.env.PORT : ""}`;

            // _parsedUrl.pathname er et objekt der indeholder alle endpoints UDEN parametrer
            var url = `${baseUrl}${request._parsedUrl.pathname}`;
            
            var paramString = "?";

            if (request.query.limit) {
                paramString = `?limit=${limit}&`;
            }
            if (!request.query.page) {
                displayedPage += 1;
            }

            paramString += `page=`;

            var restful = {
                count,
                next: (page + 1) * limit >= count ? null : `${url}${paramString}${displayedPage + 1}`,
                previous: displayedPage - 1 <= 0 ? null : `${url}${paramString}${displayedPage - 1}`,
                url: `${url}${paramString}${displayedPage}`,
                results
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