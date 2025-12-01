"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authenticated_1 = require("../../middlewares/authenticated");
const auth_1 = __importDefault(require("./auth"));
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)();
const route = (0, express_1.Router)();
route.use(upload.none());
route.use("/auth", auth_1.default);
route.use(authenticated_1.authenticated);
exports.default = route;
