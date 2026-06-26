import { Router } from "express";
import supporters from "./modules/supporters";


const router = Router();

router.use('/supporters', supporters.router);
// router.use('/hr', HR.router);
// router.use('/divisions', division.router);
// router.use('/workers', workers.router);
// router.use('/fr', FR.router);
// router.use('/iro', IRO.router);
// router.use('/application', applications.router);
// router.use('/settings', settings.router);
// router.use('/test', test.router);
// router.use('/file', fileUploader.router);
// router.use('/local_file', localFileUploader.router);
// router.use('/notification', notification.router);
// router.use('/custom-report', CR.router);


export default router;
