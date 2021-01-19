describe("FGravResponse", function () {

    describe("when using FGravResponse ", function () {

        var successfulResponse;
        var errorResponse;

        beforeEach(function () {
            successfulResponse = new FGravResponse();
            errorResponse = new FGravResponse("Err");
        });


        it("should return successful response", function () {

            expect(successfulResponse.isSuccess()).toBe(true);
        });

        it("should return unsuccessful response", function () {

            expect(errorResponse.isSuccess()).toBe(false);
        });

        it("should return unsuccessful response with status on settign an error", function () {

            expect(successfulResponse.setError("Err", "Failure").errorMessage()).toEqual("Failure - Err");
        });

        it("should return unsuccessful response with status on adding a single error", function () {

            expect(successfulResponse.addError("Err", "Failure").errorMessage()).toEqual("Failure - Err");
        });


        it("should return unsuccessful response with status on adding multiple errors", function () {

            expect(successfulResponse.addError("Err1").addError("Err2", "Failure").errorMessage()).toEqual("Failure - Err1, Err2");
        });

        it("should return error message", function () {

            expect(errorResponse.errorMessage()).toEqual("Error - Err");
        });
    });
});