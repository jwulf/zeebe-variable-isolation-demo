import { ZBClient } from "zeebe-node";
(async () => {
  const zbc = new ZBClient("localhost:26500");
  await zbc.deployWorkflow("./test.bpmn", { redeploy: false });
  const worker = zbc.createWorker(
    "test",
    "config-to-payload",
    (job, complete) => {
      // console.log(job);
      complete(job.customHeaders);
    }
  );
  const outputWorker = zbc.createWorker("test", "output", (job, complete) => {
    console.log("output", job.variables);
    complete(job.variables);
  });
  await zbc.createWorkflowInstance("test", {});
})();
