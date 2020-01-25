class APISurveysDb {
  constructor(db, dbo) {
    this.db = db;
    this.dbo = dbo;
  }

  async addSurvey(parameter, list_of_options, username, event_id) {
    try {
    } catch (err) {
      console.log(err);
    }
  }

  async addOptionToSurvey(survey_id, parameter, option, link) {
    try {
    } catch (err) {
      console.log(err);
    }
  }

  async getParametersList(event_id) {
    try {
    } catch (err) {
      console.log(err);
    }
  }

  async getSurveyOptions(survey_id) {
    try {
    } catch (err) {
      console.log(err);
    }
  }
}
module.exports = APISurveysDb;
