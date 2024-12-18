import http from "@/utils/http";

/**
 * Interface representing the project data structure.
 * @interface ProjectData
 */
export interface ProjectData {
  id: string;
  project_name: string;
  client_name: {
    id:string;
    client_name:string;
  }
  actual_start_date: string;
  actual_end_date: string;
  project_lead: {
    id:string;
    full_name:string;
  }
  project_logo?: string;
  open_for_time_entry: string;
  status: string;
  planned_start_date?: string;
  planned_end_date?: string;
  description?: string;
  billing_model?: string;
  category?: [
    {
      id:string;
      name:string;
    }
  ];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectDisplayData {
  id: string;
  project_name: string;
  client_name: string;
  actual_start_date: string;
  actual_end_date: string;
  project_lead: string;
  project_logo?: string;
  open_for_time_entry: string;
  status: string;
}

export interface ProjectLead {
  _id: string;
  full_name: string;
}

/**
 * create the custom hook for handling project list
 */
export default function useProjectListService() {
  const fetchProjectDetailsById = async function (id: string): Promise<any> {
    try {
      // Make an HTTP POST request
      const { body } = await http().post(`/api/project/get/${id}`);
      // Handle the API response and return filtered data
      console.log(id,body)
      return {
        status: body.status,
        data: body.data || [], // Return the projects data
        message: body.message || "Project details retrieved successfully.",
        errors: body.errors || null,
      };
    } catch (error: any) {
      // Return a meaningful error response
      return {
        status: false,
        message:
          error?.response?.data?.message ||
          "An error occurred while fetching project data. Please try again.",
        errors: error?.response?.data?.errors || null,
      };
    }
  };

  const fetchProjectDetails = async function (): Promise<any> {
    // const props: JSON = <JSON>(<unknown>{ page, limit }); // Request payload

    try {
      // Make an HTTP POST request
      const { body } = await http().post("/api/project/list");
      // Handle the API response and return filtered data
      return {
        status: body.status,
        data: body.data.projects || [], // Return the projects data
        total: body.data.pagination.totalPages || 0, // Total count of projects
        message: body.message || "Projects retrieved successfully.",
        errors: body.errors || null,
      };
    } catch (error: any) {
      // Return a meaningful error response
      return {
        status: false,
        message:
          error?.response?.data?.message ||
          "An error occurred while fetching projects. Please try again.",
        errors: error?.response?.data?.errors || null,
      };
    }
  };

  const updateProject = async function (
    id: string,
    payload: any
  ): Promise<any> {
    const props: JSON = <JSON>(<unknown>payload);
console.log(props);
    try {
      // Make an HTTP POST request
      const { body } = await http().post(`/api/project/update/${id}`, props);
      // Handle the API response and return filtered data
      return {
        status: body.status,
        data: body.data || [], // Return the projects data
        message: body.message,
        errors: body.errors,
      };
    } catch (error: any) {
      // Return a meaningful error response
      return {
        status: error,
        message:
          error?.response?.message ||
          "An error occurred while updating the project.",
        errors: error?.response?.data?.errors || null,
      };
    }
  };

  const changeStatus = async function (payload: any): Promise<any> {
    const props: JSON = <JSON>(<unknown>{
      payload,
    });
    try {
      // Make an HTTP POST request
      const { body } = await http().post("/api", props);
      if (body.status) {
        const response: any = {
          status: body.status,
          message: body.message,
          data: body.data ? body.data : undefined,
        };
        return response;
      } else {
        return {
          status: false,
          message: body.message,
        };
      }
    } catch (error) {
      // Handle unexpected errors
      return {
        status: false,
        message: "An error occurred. Please try again.",
      };
    }
  };

  const changeTimeEntry = async function (id: string): Promise<any> {
    const props: JSON = <JSON>(<unknown>{
      id,
    });
    try {
      // Make an HTTP POST request
      const { body } = await http().post("/api", props);
      if (body.status) {
        const response: any = {
          status: body.status,
          message: body.message,
          data: body.data ? body.data : undefined,
        };
        return response;
      } else {
        return {
          status: false,
          message: body.message,
        };
      }
    } catch (error) {
      // Handle unexpected errors
      return {
        status: false,
        message: "An error occurred. Please try again.",
      };
    }
  };

  const addProject = async function (payload: any): Promise<any> {
    const props: JSON = <JSON>(<unknown>{
      payload,
    });
    try {
      // Make an HTTP POST request
      const { body } = await http().post("/api", props);
      if (body.status) {
        const response: any = {
          status: body.status,
          message: body.message,
          data: body.data ? body.data : undefined,
        };
        return response;
      } else {
        return {
          status: false,
          message: body.message,
        };
      }
    } catch (error) {
      // Handle unexpected errors
      return {
        status: false,
        message: "An error occurred. Please try again.",
      };
    }
  };

  const fetchProjectLeads = async function (): Promise<any> {
    try {
      // Make an HTTP POST request
      const { body } = await http().post("/api/admin/get-team-leads");
      // Handle the API response and return filtered data
      return {
        status: body.status,
        data: body.data || [], // Return the projects data
        message: body.message || "Project leads retrieved successfully.",
        errors: body.errors || null,
      };
    } catch (error: any) {
      // Return a meaningful error response
      return {
        status: false,
        message:
          error?.response?.data?.message ||
          "An error occurred while fetching project leads. Please try again.",
        errors: error?.response?.data?.errors || null,
      };
    }
  };

  return {
    fetchProjectDetailsById,
    fetchProjectDetails,
    fetchProjectLeads,
    changeStatus,
    updateProject,
    addProject,
    changeTimeEntry,
  };
}
