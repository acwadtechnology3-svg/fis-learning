"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authenticated_1 = require("../../middlewares/authenticated");
const authorized_1 = require("../../middlewares/authorized");
const plans_1 = __importDefault(require("./plans"));
const auth_1 = __importDefault(require("./auth"));
const course_1 = __importDefault(require("./course"));
const matrials_1 = __importDefault(require("./matrials"));
const express_1 = require("express");
const route = (0, express_1.Router)();
route.use("/auth", auth_1.default);
route.use(authenticated_1.authenticated, (0, authorized_1.authorizeRoles)("user"));
route.use("/course", course_1.default);
route.use("/materials", matrials_1.default);
route.use("/plans", plans_1.default);
exports.default = route;
