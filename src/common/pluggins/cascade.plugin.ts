//should be used for cascading soft delete and restore operations across related models. It listens to the "findOneAndUpdate" event, which is triggered when a document is updated using findOneAndUpdate method. When a document is soft deleted (i.e., when the "deletedAt" field is set), it updates all related documents in the specified models by setting their "deletedAt" field to the current date and unsetting the "restoredAt" field. Conversely, when a document is restored (i.e., when the "restoredAt" field is set), it updates all related documents by setting their "restoredAt" field to the current date and unsetting the "deletedAt" field, but only for those that were previously soft deleted. This plugin helps maintain data integrity by ensuring that related documents are consistently marked as deleted or restored based on the state of the parent document.
// Note: The cascadeSoftDeletePlugin should be applied to the userSchema in the user.model.ts file, and the related models (e.g., Post, Comment, Reaction) should be defined with the appropriate foreign key referencing the user model for this plugin to work effectively.
//important for future reference: if you want to implement hard delete cascade, you can use the commented code in the user.model.ts file, but make sure to handle it carefully as it will permanently delete related documents without the possibility of restoration.
// need to revesion and understand more about this plugin and how to use it in the future 😪.
//now it's only used for soft delete and restore operations, but it can be extended to handle hard delete operations as well if needed in the future.
import mongoose from "mongoose";

interface ICascadeOption {
  model: string;
  foreignKey: string;
}

export function cascadeSoftDeletePlugin(schema: mongoose.Schema, options: ICascadeOption[]) {
  
  schema.post("findOneAndUpdate", async function (doc : mongoose.Document) {
    if (!doc) return;

    const update = this.getUpdate() as any;

    for (const item of options) {
      const Model = mongoose.model(item.model);

      //  SOFT DELETE
      if (update.deletedAt) {
        await Model.updateMany(
          { [item.foreignKey]: doc._id },
          {
            deletedAt: new Date(),
            $unset: { restoredAt: 1 },
          }
        );
      }

      // RESTORE
      if (update.restoredAt) {
        await Model.updateMany(
          { 
            [item.foreignKey]: doc._id,
            deletedAt: { $exists: true }
          },
          {
            restoredAt: new Date(),
            $unset: { deletedAt: 1 },
          }
        );
      }
    }
  });

}