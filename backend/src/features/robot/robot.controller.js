const { ErrorMessages } = require('#libs/constant/messages.js');
const { asyncHandler } = require('#libs/http/asyncHandler.util.js');
const { badRequest, notFound, writeJson } = require('#libs/http/response.util.js');
const { toRobotResponse } = require('./dtos/response.js');
const robotRepository = require('./robot.repository.js');

function registerRobotRoutes(app) {
  app.get(
    '/api/robots',
    asyncHandler(async (res) => {
      const robots = await robotRepository.findAll();
      writeJson(res, 200, { robots: robots.map(toRobotResponse) });
    })
  );

  app.get(
    '/api/robots/:robotId',
    asyncHandler(async (res, context) => {
      const robotId = context.params[0];
      if (!robotId) return badRequest(res, ErrorMessages.ROBOT_ID_REQUIRED);

      const robot = await robotRepository.findByRobotId(robotId);
      if (!robot) return notFound(res);

      writeJson(res, 200, { robot: toRobotResponse(robot) });
    })
  );

  return app;
}

module.exports = { registerRobotRoutes };
