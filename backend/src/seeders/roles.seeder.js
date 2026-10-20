const Role = require("../models/Role");
const { ROLES } = require("../config/constants");

const seedRoles = async () => {
  const roles = [
    {
      name: ROLES.ADMIN,
      description: "Full system access and control",
    },
    {
      name: ROLES.EMPLOYEE,
      description: "Assigned work and personal records access",
    },
  ];

  for (const role of roles) {
    await Role.findOneAndUpdate(
      { name: role.name },
      role,
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );
  }

  console.log("Roles seeded successfully");
};

module.exports = seedRoles;