import { PacienteService } from '../services/pacienteService.js';

export class PacienteController {
  constructor() {
    this.pacienteService = new PacienteService();
  }

  async createPaciente(req, res, next) {
    try {
      const paciente = await this.pacienteService.createPaciente(req.body);
      
      res.status(201).json({
        success: true,
        data: paciente,
        message: 'Paciente cadastrado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  async getPacientes(req, res, next) {
    try {
      const result = await this.pacienteService.getPacientes(req.query);
      
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  async getPacienteById(req, res, next) {
    try {
      const { id } = req.params;
      const paciente = await this.pacienteService.getPacienteById(id);
      
      res.json({
        success: true,
        data: paciente
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePaciente(req, res, next) {
    try {
      const { id } = req.params;
      const paciente = await this.pacienteService.updatePaciente(id, req.body);
      
      res.json({
        success: true,
        data: paciente,
        message: 'Paciente atualizado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  async deletePaciente(req, res, next) {
    try {
      const { id } = req.params;
      await this.pacienteService.deletePaciente(id);
      
      res.json({
        success: true,
        message: 'Paciente removido com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }
}