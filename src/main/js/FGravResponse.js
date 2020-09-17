/************************************************************************
 Copyright 2020 eBay Inc.
 Author/Developer: Amir Langer

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 https://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 **************************************************************************/

function FGravResponse(error) {
    this.setError(error);
}

FGravResponse.prototype.setError = function (error, status) {
    this.error = error;
    this.status = (error) ? ((status) ? status : "Error") : "Success";
    return this;
};

FGravResponse.prototype.addError = function (error, status) {
    if (!this.isSuccess()) {
        if (error) {
            this.error = this.error.concat(", ", error);
            this.status = ((status) ? status : "Error");
        }
    }
    else {
        this.setError(error, status);
    }
    return this;
};


FGravResponse.prototype.isSuccess = function () {
    return this.status === "Success";
};

FGravResponse.prototype.errorMessage = function () {
    return (this.isSuccess()) ? this.status : (this.status + " - " + this.error);
};